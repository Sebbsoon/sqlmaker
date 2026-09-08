import * as vscode from "vscode";
import { ConnectionManager } from "../../services/ConnectionManager";
import { PostgresExtractor } from "../../schema/PostgresExtractor";
import { AIAgentEngine } from "../../ai/AIAgentEngine";
import { ResultsPanel } from "../Resultpanel/ResultPanel";

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

    const webview = webviewView.webview;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "dist-webview",
        "assets",
        "sidebar.js",
      ),
    );

    function formatAsciiTable(rows: any[], maxColWidth = 30): string {
      if (!rows || rows.length === 0) {
        return "0 rows returned.";
      }

      const keys = Object.keys(rows[0]);

      // Calculate maximum width required for each column based on headers and row values
      const colWidths: { [key: string]: number } = {};
      keys.forEach((key) => {
        let max = key.length;
        rows.forEach((row) => {
          const valStr =
            row[key] === null || row[key] === undefined
              ? "null"
              : String(row[key]).replace(/\r?\n|\r/g, " ");
          if (valStr.length > max) {
            max = valStr.length;
          }
        });
        colWidths[key] = Math.min(max, maxColWidth);
      });

      // Helper to format individual cells
      const formatCell = (val: string, width: number) => {
        const cleanVal = val.replace(/\r?\n|\r/g, " ");
        if (cleanVal.length > width) {
          return cleanVal.slice(0, width - 3) + "...";
        }
        return cleanVal.padEnd(width, " ");
      };

      // Build top divider, header row, and mid divider
      const border =
        "+" + keys.map((k) => "-".repeat(colWidths[k] + 2)).join("+") + "+";
      const header =
        "| " + keys.map((k) => formatCell(k, colWidths[k])).join(" | ") + " |";

      // Build row strings
      const rowLines = rows.map((row) => {
        const cells = keys.map((k) => {
          const rawVal =
            row[k] === null || row[k] === undefined ? "null" : String(row[k]);
          return formatCell(rawVal, colWidths[k]);
        });
        return "| " + cells.join(" | ") + " |";
      });

      return [border, header, border, ...rowLines, border].join("\n");
    }

    webview.html = `<!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>SQLmaker</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="${scriptUri}"></script>
        </body>
      </html>`;

    webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "CONNECT_DB": {
          try {
            const config = data.config;

            await this.connManager.saveConnection(config, data.password);
            await this.connManager.connect(config);

            webview.postMessage({
              type: "CONNECT_SUCCESS",
              payload: config.name,
            });
          } catch (err: any) {
            webview.postMessage({
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

            webview.postMessage({
              type: "SCHEMA_RESULT",
              payload: schema,
            });
          } catch (err: any) {
            webview.postMessage({
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

              webview.postMessage({
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

              webview.postMessage({
                type: "SQL_RESULT",
                payload: generatedSql,
              });
            }
          } catch (err: any) {
            webview.postMessage({
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
            const fields = result.fields.map((f: { name: string }) => f.name);

            ResultsPanel.render(
              this._extensionUri,
              data.sql,
              result.rows,
              fields,

              result.rowCount ?? result.rows.length,
            );
            webviewView.webview.postMessage({
              type: "QUERY_EXECUTED",
              payload: `Query executed. Results printed to 'SQLmaker' Output channel.`,
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
}
