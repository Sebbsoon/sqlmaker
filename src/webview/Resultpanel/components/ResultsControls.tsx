const stylesheet = `
  .results-panel__controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.75rem;
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
`;

type ResultsControlsProps = {
  search: string;
  setSearch: (value: string) => void;
  rowCount: number;
};

const ResultsControls = ({
  search,
  setSearch,
  rowCount,
}: ResultsControlsProps) => (
  <>
    <style>{stylesheet}</style>

    <div className="results-panel__controls">
      <input
        className="results-panel__search"
        type="text"
        placeholder="Filter rows..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <span className="results-panel__meta">
        {rowCount} row(s) returned
      </span>
    </div>
  </>
);

export default ResultsControls;