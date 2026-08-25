import * as vscode from 'vscode';
import { ConnectionManager } from '../services/ConnectionManager';
import { PostgresExtractor } from '../schema/PostgresExtractor';

export function registerFetchSchemaCommand(
  connManager: ConnectionManager,
  extractor: PostgresExtractor,
  outputChannel: vscode.OutputChannel
): vscode.Disposable {
  return vscode.commands.registerCommand('sqlmaker.fetchSchema', async () => {
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "SQLmaker: Extracting Database Schema...",
      cancellable: false
    }, async () => {
      try {
        const pool = connManager.getPool();
        const schema = await extractor.getSchema(pool, true);
        const compactDDL = extractor.formatAsCompactDDL(schema);

        outputChannel.clear();
        outputChannel.appendLine(`-- Extracted Schema (${schema.length} tables) --\n`);
        outputChannel.appendLine(compactDDL);
        outputChannel.show(true);

        vscode.window.showInformationMessage(`Extracted schema for ${schema.length} table(s).`);
      } catch (err: any) {
        vscode.window.showErrorMessage(`Schema extraction failed: ${err.message}`);
      }
    });
  });
}