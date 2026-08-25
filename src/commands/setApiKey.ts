import * as vscode from 'vscode';

export function registerSetApiKeyCommand(context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.commands.registerCommand('sqlmaker.setApiKey', async () => {
    const apiKey = await vscode.window.showInputBox({
      prompt: 'Enter your OpenAI API Key (sk-...)',
      password: true,
      ignoreFocusOut: true
    });

    if (apiKey) {
      await context.secrets.store('sqlmaker.openai.apikey', apiKey);
      vscode.window.showInformationMessage('SQLmaker: OpenAI API Key saved securely.');
    }
  });
}