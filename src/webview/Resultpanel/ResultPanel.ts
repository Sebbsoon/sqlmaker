import * as vscode from "vscode";

export class ResultsPanel {
  public static currentPanel: ResultsPanel | undefined;

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  public static render(
    extensionUri: vscode.Uri,
    sql: string,
    rows: Record<string, unknown>[],
    fields: string[],
    rowCount: number,
  ) {
    if (ResultsPanel.currentPanel) {
      ResultsPanel.currentPanel._panel.reveal(vscode.ViewColumn.Beside);
    } else {
      const panel = vscode.window.createWebviewPanel(
        "sqlmakerResults",
        "SQLmaker Query Results",
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [
            vscode.Uri.joinPath(extensionUri, "dist"),
            vscode.Uri.joinPath(extensionUri, "dist-webview"),
          ],
        },
      );

      ResultsPanel.currentPanel = new ResultsPanel(panel, extensionUri);
    }

    ResultsPanel.currentPanel._update(sql, rows, fields, rowCount);
  }

  private _update(
    sql: string,
    rows: Record<string, unknown>[],
    fields: string[],
    rowCount: number,
  ) {
    this._panel.title = `Results (${rowCount} rows)`;
    this._panel.webview.html = this._getHtmlForWebview(
      sql,
      rows,
      fields,
      rowCount,
    );
  }

  private _getHtmlForWebview(
    sql: string,
    rows: Record<string, unknown>[],
    fields: string[],
    rowCount: number,
  ): string {
    const webview = this._panel.webview;

    // This bundle must include results-main.tsx.
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "dist-webview",
        "assets",
        "results.js",
      ),
    );

    const data = JSON.stringify({
      sql,
      rows,
      fields,
      rowCount,
    }).replace(/</g, "\\u003c");

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Query Results</title>
</head>
<body>
  <div id="root"></div>

  <script id="results-data" type="application/json">${data}</script>
  <script type="module" src="${scriptUri}"></script>
</body>
</html>`;
  }

  public dispose() {
    ResultsPanel.currentPanel = undefined;
    this._panel.dispose();

    while (this._disposables.length) {
      this._disposables.pop()?.dispose();
    }
  }
}
