import { useState } from "react";
import type { BoardRecievedInterface } from "~/state";
import log from "~/utils/logger";
import BoardCardDeleteButton from "./board-list-card-delete-btn";
import BoardCardEditForm from "./board-list-card-edit-form";
const logger = log.getLogger("BOARD-LIST-CARD-ITEM LOGGER");
logger.setLevel(import.meta.env.DEV ? "debug" : "warn");

function BoardCardItem({
  cardId,
  cardName,
  listId,
  token,
  board,
}: {
  cardId: number;
  cardName: string;
  listId: number;
  token: string;
  board: BoardRecievedInterface;
}) {
  const [editBoardCardName, setEditCardName] = useState(false);

  const handleListTitleClick = () => {
    setEditCardName(true);
  };

  return (
    <div className="board-card-item h-full w-full p-5 bg-white/40 dark:bg-black/40 backdrop-blur-md backdrop-saturate-100 border border-white/30 dark:border-black/30 rounded-sm shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] my-1">
      <div className="board-card-item-edit-container">
        {editBoardCardName ? (
          <BoardCardEditForm
            cardId={cardId}
            cardName={cardName}
            listId={listId}
            boardId={board.id}
            setEditFormActive={setEditCardName}
          />
        ) : (
          <button onClick={handleListTitleClick}>
            <BoardCardDeleteButton
              board={board}
              listId={listId}
              cardId={cardId}
              token={token}
            />
            <h2 className="text-4xl wrap-anywhere text-left">{cardName}</h2>
          </button>
        )}
      </div>
    </div>
  );
}

export default BoardCardItem;
