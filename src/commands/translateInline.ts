import * as vscode from 'vscode';
import { ConnectionManager } from '../services/ConnectionManager';
import { PostgresExtractor } from '../schema/PostgresExtractor';
import { AIAgentEngine } from '../ai/AIAgentEngine';

export function registerTranslateInlineCommand(
  context: vscode.ExtensionContext,
  connManager: ConnectionManager,
  extractor: PostgresExtractor
): vscode.Disposable {
  return vscode.commands.registerCommand('sqlmaker.translateInline', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active text editor found.');
      return;
    }

    const selection = editor.selection;
    let promptText = editor.document.getText(selection.isEmpty ? undefined : selection).trim();
    promptText = promptText.replace(/^(--|\/\/|\/\*|\*\/)\s*/gm, '').trim();

    if (!promptText) {
      vscode.window.showWarningMessage('Highlight text or place cursor on a prompt line.');
      return;
    }

    const apiKey = await context.secrets.get('sqlmaker.openai.apikey');
    if (!apiKey) {
      vscode.window.showErrorMessage('OpenAI API Key missing. Run "SQLmaker: Set OpenAI API Key" first.');
      return;
    }

    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'SQLmaker: Generating SQL...',
      cancellable: false
    }, async () => {
      try {
        const pool = connManager.getPool();
        const schema = await extractor.getSchema(pool);
        const compactDDL = extractor.formatAsCompactDDL(schema);

        const ai = new AIAgentEngine(apiKey);
        const sqlResult = await ai.generateSQL(promptText, compactDDL);

        await editor.edit(editBuilder => {
          if (selection.isEmpty) {
            editBuilder.insert(selection.active, `\n${sqlResult}\n`);
          } else {
            editBuilder.replace(selection, sqlResult);
          }
        });
      } catch (err: any) {
        vscode.window.showErrorMessage(`Generation Error: ${err.message}`);
      }
    });
  });
}