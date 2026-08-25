import * as vscode from 'vscode';
import { ConnectionManager } from '../services/ConnectionManager';
import { PostgresExtractor } from '../schema/PostgresExtractor';
import { AIAgentEngine } from '../ai/AIAgentEngine';

export function registerChatParticipant(
  context: vscode.ExtensionContext,
  connManager: ConnectionManager,
  extractor: PostgresExtractor
): void {
  const participant = vscode.chat.createChatParticipant('sqlmaker.chatParticipant', async (request, chatContext, stream, token) => {
    stream.progress('Extracting database schema...');

    let compactDDL = '';
    try {
      const pool = connManager.getPool();
      const schema = await extractor.getSchema(pool);
      compactDDL = extractor.formatAsCompactDDL(schema);
    } catch (err: any) {
      stream.markdown(`> ⚠️ **Database Warning**: ${err.message}. Generating query without active schema context.\n\n`);
    }

    const systemPrompt = `
You are @sqlmaker, a Principal PostgreSQL DBA embedded inside VS Code.
Translate natural language requests into valid PostgreSQL queries based on the schema below.

DATABASE SCHEMA:
${compactDDL || 'No active connection. Infer standard PostgreSQL schema.'}

RULES:
1. Output ONLY PostgreSQL queries wrapped inside \`\`\`sql ... \`\`\` code blocks.
2. Rely strictly on tables and columns in the schema. Respect PK/FK annotations.
3. Keep explanations concise.
`;

    const availableModels = await vscode.lm.selectChatModels();

    if (availableModels.length > 0) {
      // Path A: VS Code Language Model API
      const model = availableModels[0];
      const messages = [
        vscode.LanguageModelChatMessage.User(systemPrompt),
        ...chatContext.history.map(h => {
          if (h instanceof vscode.ChatRequestTurn) {
            return vscode.LanguageModelChatMessage.User(h.prompt);
          } else {
            return vscode.LanguageModelChatMessage.Assistant((h.response[0] as any)?.value || '');
          }
        }),
        vscode.LanguageModelChatMessage.User(request.prompt)
      ];

      const chatResponse = await model.sendRequest(messages, {}, token);
      for await (const fragment of chatResponse.text) {
        stream.markdown(fragment);
      }
    } else {
      // Path B: Direct OpenAI API Key Fallback
      const apiKey = await context.secrets.get('sqlmaker.openai.apikey');

      if (!apiKey) {
        stream.markdown(
          '❌ **No LLM Provider Found**\n\n' +
          'Option 1: Set OpenAI API Key via `SQLmaker: Set OpenAI API Key`.\n' +
          'Option 2: Enable GitHub Copilot Chat in VS Code.'
        );
        return;
      }

      stream.progress('Generating SQL via OpenAI API...');

      try {
        const aiEngine = new AIAgentEngine(apiKey);
        const generatedSQL = await aiEngine.generateSQL(request.prompt, compactDDL);
        stream.markdown('```sql\n' + generatedSQL + '\n```');
      } catch (err: any) {
        stream.markdown(`❌ **OpenAI Generation Error**: ${err.message}`);
      }
    }
  });

  context.subscriptions.push(participant);
}