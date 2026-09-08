import ResultsTableRow from "./ResultsTableRow";

type ResultsTableBodyProps = {
  rows: Record<string, unknown>[];
  fields: string[];
};

const ResultsTableBody = ({ rows, fields }: ResultsTableBodyProps) => {
  return (
    <tbody>
      {rows.map((row, rowIndex) => (
        <ResultsTableRow
          key={rowIndex}
          row={row}
          rowIndex={rowIndex}
          fields={fields}
        />
      ))}
    </tbody>
  );
};

export default ResultsTableBody;