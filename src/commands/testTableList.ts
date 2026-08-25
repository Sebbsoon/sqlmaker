import * as vscode from 'vscode';
import { ConnectionManager } from '../services/ConnectionManager';

export function registerTestTableListCommand(
  connManager: ConnectionManager,
  outputChannel: vscode.OutputChannel
): vscode.Disposable {
  return vscode.commands.registerCommand('sqlmaker.testTableList', async () => {
    try {
      const pool = connManager.getPool();
      const query = `
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
          AND table_type = 'BASE TABLE'
        ORDER BY table_schema, table_name;
      `;

      const result = await pool.query(query);
      const tables = result.rows;

      if (tables.length === 0) {
        vscode.window.showWarningMessage('Connected, but 0 base tables found.');
        return;
      }

      outputChannel.clear();
      outputChannel.appendLine(`Found ${tables.length} table(s):`);
      tables.forEach(t => outputChannel.appendLine(` - ${t.table_schema}.${t.table_name}`));
      outputChannel.show(true);

    } catch (err: any) {
      vscode.window.showErrorMessage(`Schema Test Failed: ${err.message}`);
    }
  });
}