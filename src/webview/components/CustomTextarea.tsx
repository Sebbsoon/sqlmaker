const stylesheet = `
  .custom-textarea {
    box-sizing: border-box;
    width: 100%;
    min-height: 8rem;
    resize: vertical;
    border: 1px solid var(--vscode-input-border, #3c3c3c);
    border-radius: 0.125rem;
    background: var(--vscode-input-background, #3c3c3c);
    padding: 0.5rem;
    color: var(--vscode-input-foreground, #ccc);
    font: inherit;
  }

  .custom-textarea::placeholder {
    color: var(--vscode-input-placeholderForeground, #888);
  }

  .custom-textarea:focus-visible {
    outline: 1px solid var(--vscode-focusBorder, #007fd4);
  }
`;

const CustomTextarea = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => {
  return (
    <>
      <style>{stylesheet}</style>

      <textarea
        className="custom-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </>
  );
};

export default CustomTextarea;