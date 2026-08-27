import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { ConnectionManager } from "../services/ConnectionManager";
import { PostgresExtractor } from "../schema/PostgresExtractor";
import { AIAgentEngine } from "../ai/AIAgentEngine";

export class SidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "sqlmaker.sidebarView";
  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly context: vscode.ExtensionContext,
    private readonly connManager: ConnectionManager,
    private readonly extractor: PostgresExtractor,
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview();

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "CONNECT_DB": {
          try {
            const config = data.config;

            await this.connManager.saveConnection(config, data.password);
            await this.connManager.connect(config);

            webviewView.webview.postMessage({
              type: "CONNECT_SUCCESS",
              payload: config.name,
            });
          } catch (err: any) {
            webviewView.webview.postMessage({
              type: "ERROR",
              payload: err.message,
            });
          }
          break;
        }

        case "GET_SCHEMA": {
          try {
            const pool = this.connManager.getPool();
            const schema = await this.extractor.getSchema(pool);
            webviewView.webview.postMessage({
              type: "SCHEMA_RESULT",
              payload: schema,
            });
          } catch (err: any) {
            webviewView.webview.postMessage({
              type: "ERROR",
              payload: err.message,
            });
          }
          break;
        }

        case "GENERATE_SQL": {
          try {
            const pool = this.connManager.getPool();
            const schema = await this.extractor.getSchema(pool);
            const compactDDL = this.extractor.formatAsCompactDDL(schema);

            const systemPrompt = `
You are @sqlmaker, a Principal PostgreSQL DBA.
Translate the user prompt into a valid PostgreSQL query based on the schema below.

DATABASE SCHEMA:
${compactDDL}

RULES:
1. Return ONLY the raw SQL query wrapped inside \`\`\`sql ... \`\`\` code blocks.
2. Rely strictly on tables and columns provided in the schema above.
3. Default to read-only queries unless explicitly instructed otherwise.
`;

            const availableModels = await vscode.lm.selectChatModels();

            if (availableModels.length > 0) {
              const model = availableModels[0];
              const messages = [
                vscode.LanguageModelChatMessage.User(systemPrompt),
                vscode.LanguageModelChatMessage.User(data.prompt),
              ];

              const chatResponse = await model.sendRequest(
                messages,
                {},
                _token,
              );
              let rawOutput = "";
              for await (const fragment of chatResponse.text) {
                rawOutput += fragment;
              }

              const match = rawOutput.match(/```sql\s*([\s\S]*?)\s*```/i);
              const generatedSql = match
                ? match[1].trim()
                : rawOutput.replace(/```/g, "").trim();

              webviewView.webview.postMessage({
                type: "SQL_RESULT",
                payload: generatedSql,
              });
            } else {
              const apiKey = await this.context.secrets.get(
                "sqlmaker.openai.apikey",
              );
              if (!apiKey) {
                throw new Error(
                  "No connected Language Model found in VS Code, and no OpenAI API Key configured. " +
                    'Please run "SQLmaker: Set OpenAI API Key" or log into GitHub Copilot.',
                );
              }

              const ai = new AIAgentEngine(apiKey);
              const generatedSql = await ai.generateSQL(
                data.prompt,
                compactDDL,
              );

              webviewView.webview.postMessage({
                type: "SQL_RESULT",
                payload: generatedSql,
              });
            }
          } catch (err: any) {
            webviewView.webview.postMessage({
              type: "ERROR",
              payload: err.message,
            });
          }
          break;
        }

        case "EXECUTE_QUERY": {
          try {
            const pool = this.connManager.getPool();
            const result = await pool.query(data.sql);
            webviewView.webview.postMessage({
              type: "QUERY_RESULTS",
              payload: {
                rows: result.rows,
                fields: result.fields.map((f: { name: string }) => f.name),
              },
            });
          } catch (err: any) {
            webviewView.webview.postMessage({
              type: "ERROR",
              payload: err.message,
            });
          }
          break;
        }
      }
    });
  }

  private _getHtmlForWebview(): string {
    const htmlPath = path.join(
      this._extensionUri.fsPath,
      "src",
      "html",
      "HTMLView.html",
    );
    return fs.readFileSync(htmlPath, "utf8");
  }
}
