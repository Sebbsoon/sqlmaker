import { Views } from "../types/enums";
import HeaderMenuButton from "./HeaderMenuButton";

const stylesheet = `
  .header-menu {
    display: flex;
    gap: 0.25rem;
    border-bottom: 1px solid var(--vscode-panel-border, #333);
    background: var(--vscode-titleBar-activeBackground, #181818);
    padding: 0.5rem;
  }
`;

type HeaderMenuProps = {
  currentView: Views;
  setCurrentView: React.Dispatch<React.SetStateAction<Views>>;
};

const HeaderMenu = ({ currentView, setCurrentView }: HeaderMenuProps) => {
  return (
    <>
      <style>{stylesheet}</style>

      <nav className="header-menu" aria-label="Main navigation">
        <HeaderMenuButton
          onClick={() => setCurrentView(Views.CONNECTION)}
          selected={currentView === Views.CONNECTION}
          label="Connection"
        />
        <HeaderMenuButton
          onClick={() => setCurrentView(Views.QUERY)}
          selected={currentView === Views.QUERY}
          label="Query"
        />
      </nav>
    </>
  );
};

export default HeaderMenu;
