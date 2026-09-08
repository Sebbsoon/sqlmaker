import { useState } from "react";
import ResultsControls from "../components/ResultsControls";
import ResultsTable from "../components/ResultsTable";

const stylesheet = `
  .results-panel {
    padding: 1rem;
    color: var(--vscode-foreground);
    background: var(--vscode-editor-background);
    font-family: var(--vscode-font-family);
  }

  .results-panel__sql {
    margin-bottom: 0.75rem;
    overflow-x: auto;
    border: 1px solid var(--vscode-panel-border);
    border-radius: 0.25rem;
    background: var(--vscode-textCodeBlock-background);
    padding: 0.5rem 0.75rem;
    font-family: var(--vscode-editor-font-family);
    font-size: 12px;
  }

  .results-panel__controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    gap: 1rem;
  }

  .results-panel__search {
    width: 250px;
    border: 1px solid var(--vscode-input-border);
    border-radius: 2px;
    background: var(--vscode-input-background);
    padding: 0.375rem 0.625rem;
    color: var(--vscode-input-foreground);
  }

  .results-panel__meta {
    color: var(--vscode-descriptionForeground);
    font-size: 12px;
  }

  .results-panel__table-container {
    max-height: calc(100vh - 160px);
    overflow: auto;
    border: 1px solid var(--vscode-panel-border);
  }

  .results-panel__table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    white-space: nowrap;
  }

  .results-panel__table th {
    position: sticky;
    top: 0;
    z-index: 1;
    border-bottom: 2px solid var(--vscode-panel-border);
    background: var(--vscode-editorHeader-noTabsBackground, #252526);
    padding: 0.5rem 0.75rem;
    text-align: left;
  }

  .results-panel__table td {
    max-width: 300px;
    overflow: hidden;
    border-bottom: 1px solid var(--vscode-panel-border);
    padding: 0.375rem 0.75rem;
    text-overflow: ellipsis;
  }

  .results-panel__table tr:nth-child(even) {
    background: var(--vscode-list-hoverBackground);
  }

  .results-panel__null {
    color: var(--vscode-descriptionForeground);
    font-style: italic;
  }
`;

type ResultsViewProps = {
  sql: string;
  rows: Record<string, unknown>[];
  fields: string[];
  rowCount: number;
};

const ResultsView = ({
  sql,
  rows,
  fields,
  rowCount,
}: ResultsViewProps) => {
  const [search, setSearch] = useState("");

  const filteredRows = rows.filter((row) =>
    Object.values(row).some((value) =>
      String(value ?? "").toLowerCase().includes(search.toLowerCase()),
    ),
  );

  return (
    <>
      <style>{stylesheet}</style>

      <main className="results-panel">
        <pre className="results-panel__sql">{sql}</pre>

        
        <ResultsControls
          search={search}
          setSearch={setSearch}
          rowCount={rowCount}
        />

        <ResultsTable rows={filteredRows} fields={fields} />
      </main>
    </>
  );
};

export default ResultsView;