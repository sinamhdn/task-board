import { createContext, useContext, useState, type ReactNode } from "react";
import log from "~/utils/logger";

const logger = log.getLogger("BOARD ADD PROVIDER LOGGER");
logger.setLevel(import.meta.env.DEV ? "debug" : "warn");

interface BoardAddNewContextType {
  showAddNewBoardForm: boolean;
  handleAddNewBoardClick: () => void;
  handleCancelAddNewBoardClick: () => void;
}

const BoardAddNewContext = createContext<BoardAddNewContextType | null>(null);

export function BoardAddProvider({ children }: { children: ReactNode }) {
  const [showAddNewBoardForm, setShowAddNewBoardForm] = useState(false);

  function handleAddNewBoardClick() {
    setShowAddNewBoardForm(true);
  }

  function handleCancelAddNewBoardClick() {
    logger.info("handleCancelAddNewBoardClick clicked");
    setShowAddNewBoardForm(false);
  }

  return (
    <BoardAddNewContext.Provider
      value={{
        showAddNewBoardForm,
        handleAddNewBoardClick,
        handleCancelAddNewBoardClick,
      }}
    >
      {children}
    </BoardAddNewContext.Provider>
  );
}

export function useAddNewBoardForm() {
  const context = useContext(BoardAddNewContext);
  if (!context) {
    throw new Error("useAddNewBoardForm must be used inside ThemeProvider.");
  }
  return context;
}
