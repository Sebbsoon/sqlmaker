import * as vscode from "vscode";
import { ConnectionManager, DBConfig } from "../services/ConnectionManager";
import { PostgresExtractor } from "../schema/PostgresExtractor";

export function registerAddConnectionCommand(
  connManager: ConnectionManager,
  extractor: PostgresExtractor,
): vscode.Disposable {
  return vscode.commands.registerCommand("sqlmaker.addConnection", async () => {
    const host = await vscode.window.showInputBox({
      prompt: "Database Host",
      value: "localhost",
    });
    if (!host) {
      return;
    }

    const database = await vscode.window.showInputBox({
      prompt: "Database Name",
      value: "ring20_db",
    });
    if (!database) {
      return;
    }

    const user = await vscode.window.showInputBox({
      prompt: "Database User",
      value: "postgres",
    });
    if (!user) {
      return;
    }

    const password = await vscode.window.showInputBox({
      prompt: "Database Password",
      password: true,
    });

    const config: DBConfig = {
      id: `pg-${Date.now()}`,
      name: `${database}@${host}`,
      type: "postgres",
      host,
      port: 5432,
      database,
      user,
    };

    try {
      await connManager.saveConnection(config, password);
      await connManager.connect(config);
      extractor.clearCache();
    } catch (err: any) {
      vscode.window.showErrorMessage(`Failed to connect: ${err.message}`);
    }
  });
}
