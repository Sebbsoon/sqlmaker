type ResultsTableRowProps = {
  row: Record<string, unknown>;
  rowIndex: number;
  fields: string[];
};

const ResultsTableRow = ({
  row,
  rowIndex,
  fields,
}: ResultsTableRowProps) => {
  return (
    <tr key={rowIndex}>
      {fields.map((field) => {
        const value = row[field];

        return (
          <td key={field} title={String(value ?? "")}>
            {value === null || value === undefined ? (
              <span className="results-panel__null">null</span>
            ) : (
              String(value)
            )}
          </td>
        );
      })}
    </tr>
  );
};

export default ResultsTableRow;