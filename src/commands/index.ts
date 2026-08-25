import * as vscode from 'vscode';
import { ConnectionManager } from '../services/ConnectionManager';
import { PostgresExtractor } from '../schema/PostgresExtractor';

import { registerSetApiKeyCommand } from './setApiKey';
import { registerAddConnectionCommand } from './addConnection';
import { registerTestTableListCommand } from './testTableList';
import { registerFetchSchemaCommand } from './fetchSchema';
import { registerTranslateInlineCommand } from './translateInline';
import { registerCheckLLMsCommand } from './checkLLMs';

export function registerCommands(
  context: vscode.ExtensionContext,
  connManager: ConnectionManager,
  extractor: PostgresExtractor,
  outputChannel: vscode.OutputChannel
): void {
  context.subscriptions.push(
    registerSetApiKeyCommand(context),
    registerAddConnectionCommand(connManager, extractor),
    registerTestTableListCommand(connManager, outputChannel),
    registerFetchSchemaCommand(connManager, extractor, outputChannel),
    registerTranslateInlineCommand(context, connManager, extractor),
    registerCheckLLMsCommand(outputChannel)
  );
}