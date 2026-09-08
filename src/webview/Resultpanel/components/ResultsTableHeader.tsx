type ResultsTableHeaderProps = {
  fields: string[];
};

const ResultsTableHeader = ({ fields }: ResultsTableHeaderProps) => {
  return (
    <thead>
      <tr>
        {fields.map((field) => (
          <th key={field}>{field}</th>
        ))}
      </tr>
    </thead>
  );
};

export default ResultsTableHeader;