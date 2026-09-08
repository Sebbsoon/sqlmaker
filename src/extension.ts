import * as vscode from 'vscode';
import { ConnectionManager } from './services/ConnectionManager';
import { PostgresExtractor } from './schema/PostgresExtractor';
import { registerCommands } from './commands';
import { registerChatParticipant } from './chat/SqlMakerChatParticipant';
import { SidebarProvider } from './webview/Sidebar/SidebarProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log('SQLmaker extension activating...');

  // Initialize Core Services
  const connManager = new ConnectionManager(context);
  const extractor = new PostgresExtractor();
  const outputChannel = vscode.window.createOutputChannel('SQLmaker');

  const sidebarProvider = new SidebarProvider(context.extensionUri, context, connManager, extractor);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(SidebarProvider.viewType, sidebarProvider)
  );
  // Register Subsystems
  registerCommands(context, connManager, extractor, outputChannel);
  registerChatParticipant(context, connManager, extractor);

  context.subscriptions.push(outputChannel);
}

export function deactivate() {}