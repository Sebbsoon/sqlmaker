import CustomButton from "./CustomButton";

const stylesheet = `
  .query-output {
    margin-top: 1rem;
  }

  .query-output-content {
    white-space: pre-wrap;
    overflow-x: auto;
    border: 1px solid var(--vscode-panel-border, #333);
    background: var(--vscode-textCodeBlock-background, #1e1e1e);
    padding: 0.75rem;
    color: var(--vscode-foreground, #ccc);
    font-family: var(--vscode-editor-font-family, monospace);
  }
`;

type QueryOutputProps = {
  output: string | null;
  runQuery: (sql: string) => void;
};

const QueryOutput = ({ output, runQuery }: QueryOutputProps) => {
  if (!output) {
    return <p>No output to display</p>;
  }
  return (
    <>
      <style>{stylesheet}</style>

      <div className="query-output" aria-label="Query output">
        <div className="query-output-content">{output}</div>

        {output.toLowerCase().includes("select") && (
          <CustomButton onClick={() => runQuery(output)} label="Run Query" />
        )}
      </div>
    </>
  );
};

export default QueryOutput;
