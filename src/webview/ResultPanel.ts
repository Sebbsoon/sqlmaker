import * as vscode from 'vscode';

export class ResultsPanel {
  public static currentPanel: ResultsPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel) {
    this._panel = panel;

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  public static render(sql: string, rows: any[], fields: string[], rowCount: number) {
    // If we already have a panel, reveal it; otherwise, create a new one
    if (ResultsPanel.currentPanel) {
      ResultsPanel.currentPanel._panel.reveal(vscode.ViewColumn.Beside);
    } else {
      const panel = vscode.window.createWebviewPanel(
        'sqlmakerResults',
        'SQLmaker Query Results',
        vscode.ViewColumn.Beside, // Opens side-by-side with your active editor
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      );

      ResultsPanel.currentPanel = new ResultsPanel(panel);
    }

    ResultsPanel.currentPanel._update(sql, rows, fields, rowCount);
  }

  private _update(sql: string, rows: any[], fields: string[], rowCount: number) {
    this._panel.title = `Results (${rowCount} rows)`;
    this._panel.webview.html = this._getHtmlForWebview(sql, rows, fields, rowCount);
  }

  public dispose() {
    ResultsPanel.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _getHtmlForWebview(sql: string, rows: any[], fields: string[], rowCount: number): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Query Results</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 16px;
      margin: 0;
    }
    .header {
      margin-bottom: 12px;
    }
    .sql-code {
      background: var(--vscode-textCodeBlock-background);
      padding: 8px 12px;
      border-radius: 4px;
      font-family: var(--vscode-editor-font-family);
      font-size: 12px;
      overflow-x: auto;
      margin-bottom: 12px;
      border: 1px solid var(--vscode-panel-border);
    }
    .controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    input[type="text"] {
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      padding: 6px 10px;
      border-radius: 2px;
      width: 250px;
      font-size: 12px;
    }
    .meta {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
    }
    .table-container {
      overflow: auto;
      max-height: calc(100vh - 160px);
      border: 1px solid var(--vscode-panel-border);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      white-space: nowrap;
    }
    th {
      position: sticky;
      top: 0;
      background: var(--vscode-editorHeader-noTabsBackground, #252526);
      color: var(--vscode-foreground);
      border-bottom: 2px solid var(--vscode-panel-border);
      padding: 8px 12px;
      text-align: left;
      font-weight: bold;
      z-index: 10;
    }
    td {
      border-bottom: 1px solid var(--vscode-panel-border);
      padding: 6px 12px;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    tr:nth-child(even) {
      background: var(--vscode-list-hoverBackground);
    }
    .null-val {
      color: var(--vscode-descriptionForeground);
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="sql-code"><code>${escapeHtml(sql)}</code></div>
    <div class="controls">
      <input type="text" id="searchInput" placeholder="Filter rows..." />
      <span class="meta">${rowCount} row(s) returned</span>
    </div>
  </div>

  <div class="table-container">
    <table id="resultsTable">
      <thead>
        <tr>
          ${fields.map(f => `<th>${escapeHtml(f)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map(row => `
          <tr>
            ${fields.map(f => {
              const val = row[f];
              if (val === null || val === undefined) {
                return '<td class="null-val">null</td>';
              }
              const strVal = String(val);
              return `<td title="${escapeHtml(strVal)}">${escapeHtml(strVal)}</td>`;
            }).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <script>
    // Client-side quick filter
    document.getElementById('searchInput').addEventListener('input', function(e) {
      const term = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('#resultsTable tbody tr');

      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
      });
    });
  </script>
</body>
</html>`.trim();
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}