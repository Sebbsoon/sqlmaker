const stylesheet = `
  .header-menu-button {
    border: 0;
    border-bottom: 2px solid transparent;
    padding: 0.375rem 0.75rem;
    font: inherit;
    background: transparent;
    color: var(--vscode-tab-inactiveForeground, #aaa);
    transition: background-color 150ms ease, color 150ms ease;
  }

  .header-menu-button:hover {
    background: var(--vscode-toolbar-hoverBackground, #2a2d2e);
    color: var(--vscode-tab-activeForeground, #fff);
  }

  .header-menu-button.selected {
    border-bottom-color: var(--vscode-focusBorder, #007fd4);
    background: var(--vscode-tab-activeBackground, #1f1f1f);
    color: var(--vscode-tab-activeForeground, #fff);
  }

  .header-menu-button:focus-visible {
    outline: 1px solid var(--vscode-focusBorder, #007fd4);
  }
`;

const HeaderMenuButton = ({
  onClick,
  selected,
  label,
}: {
  onClick: () => void;
  selected: boolean;
  label: string;
}) => {
  return (
    <>
      <style>{stylesheet}</style>

      <button
        className={`header-menu-button${selected ? " selected" : ""}`}
        onClick={onClick}
        aria-current={selected ? "page" : undefined}
      >
        {label}
      </button>
    </>
  );
};

export default HeaderMenuButton;
