import * as vscode from 'vscode';

export function registerCheckLLMsCommand(outputChannel: vscode.OutputChannel): vscode.Disposable {
  return vscode.commands.registerCommand('sqlmaker.checkLLMs', async () => {
    try {
      const models = await vscode.lm.selectChatModels();
      outputChannel.clear();

      if (models.length === 0) {
        vscode.window.showWarningMessage('No VS Code Language Models active (GitHub Copilot / BYOK).');
        outputChannel.appendLine('Result: 0 models returned from vscode.lm.selectChatModels().');
      } else {
        vscode.window.showInformationMessage(`Found ${models.length} connected Language Model(s).`);
        models.forEach((m, idx) => {
          outputChannel.appendLine(`[Model ${idx + 1}] ID: ${m.id} | Vendor: ${m.vendor} | Family: ${m.family}`);
        });
      }
      outputChannel.show(true);
    } catch (err: any) {
      vscode.window.showErrorMessage(`LLM Check Failed: ${err.message}`);
    }
  });
}