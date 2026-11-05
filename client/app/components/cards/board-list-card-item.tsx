import { useState } from "react";
import BoardCardAddForm from "./board-list-card-add-form";
import BoardCardEditForm from "./board-list-card-edit-form";

function BoardCardItem({
  cardId,
  cardName,
  listId,
  boardId,
  token,
  newCardFormActive,
  onCancelCardForm,
}: {
  cardId: number;
  cardName: string;
  listId: number;
  boardId: number;
  token: string;
  newCardFormActive: boolean;
  onCancelCardForm: () => void;
}) {
  const [editBoardCardName, setEditCardName] = useState(false);

  const handleListTitleClick = () => {
    setEditCardName(true);
  };

  return (
    <div className="board-card-item">
      <div>
        {editBoardCardName ? (
          <BoardCardEditForm
            cardId={cardId}
            cardName={cardName}
            listId={listId}
            boardId={boardId}
            setEditFormActive={setEditCardName}
          />
        ) : (
          <button onClick={handleListTitleClick}>
            <h2 className="text-4xl">{cardName}</h2>
          </button>
        )}
      </div>
      <div>
        {newCardFormActive && token && (
          <BoardCardAddForm
            boardId={boardId}
            listId={listId}
            token={token}
            handleCancelAddNewCardClick={onCancelCardForm}
          />
        )}
      </div>
    </div>
  );
}

export default BoardCardItem;
