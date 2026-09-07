const stylesheet = `
  .custom-input-label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    color: var(--vscode-foreground, #ccc);
    font-size: 13px;
  }

  .custom-input {
    box-sizing: border-box;
    min-height: 1.75rem;
    border: 1px solid var(--vscode-input-border, #3c3c3c);
    border-radius: 0.125rem;
    background: var(--vscode-input-background, #3c3c3c);
    padding: 0.25rem 0.5rem;
    color: var(--vscode-input-foreground, #ccc);
    font: inherit;
  }

  .custom-input::placeholder {
    color: var(--vscode-input-placeholderForeground, #888);
  }

  .custom-input:focus-visible {
    outline: 1px solid var(--vscode-focusBorder, #007fd4);
  }
`;

const CustomInput = ({
  value,
  onChange,
  placeholder,
  label,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
  type?: string;
}) => {
  return (
    <>
      <style>{stylesheet}</style>

      <label className="custom-input-label">
        <span>{label}</span>
        <input
          className="custom-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type={type}
        />
      </label>
    </>
  );
};

export default CustomInput;
