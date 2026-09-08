import ResultsTableHeader from "./ResultsTableHeader";
import ResultsTableBody from "./ResultsTableBody";

const stylesheet = `
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

type ResultsTableProps = {
  rows: Record<string, unknown>[];
  fields: string[];
};

const ResultsTable = ({ rows, fields }: ResultsTableProps) => (
  <>
    <style>{stylesheet}</style>

    <div className="results-panel__table-container">
      <table className="results-panel__table">
        <ResultsTableHeader fields={fields} />
        <ResultsTableBody rows={rows} fields={fields} />
      </table>
    </div>
  </>
);

export default ResultsTable;
