const stylesheet = `
  .custom-button {
    border: 1px solid var(--vscode-button-background, #0e639c);
    border-radius: 0.125rem;
    background: var(--vscode-button-background, #0e639c);
    padding: 0.375rem 0.75rem;
    color: var(--vscode-button-foreground, #fff);
    font: inherit;
  }

  .custom-button:hover {
    background: var(--vscode-button-hoverBackground, #1177bb);
  }

  .custom-button:focus-visible {
    outline: 1px solid var(--vscode-focusBorder, #007fd4);
  }
`;

const CustomButton = ({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) => {
  return (
    <>
      <style>{stylesheet}</style>

      <button className="custom-button" onClick={onClick}>
        {label}
      </button>
    </>
  );
};

export default CustomButton;
