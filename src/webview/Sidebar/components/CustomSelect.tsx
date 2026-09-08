const stylesheet = `
  .custom-select-label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    color: var(--vscode-foreground, #ccc);
    font-size: 13px;
  }

  .custom-select {
    box-sizing: border-box;
    min-height: 1.75rem;
    border: 1px solid var(--vscode-input-border, #3c3c3c);
    border-radius: 0.125rem;
    background: var(--vscode-input-background, #3c3c3c);
    padding: 0.25rem 0.5rem;
    color: var(--vscode-input-foreground, #ccc);
    font: inherit;
  }

  .custom-select:focus-visible {
    outline: 1px solid var(--vscode-focusBorder, #007fd4);
  }
`;

const CustomSelect = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <>
      <style>{stylesheet}</style>

      <label className="custom-select-label">
        <span>{label}</span>
        <select
          className="custom-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </>
  );
};

export default CustomSelect;
