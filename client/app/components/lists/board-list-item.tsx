import { useEffect, useState } from "react";
import { getAllCards } from "~/state/cardSlice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import log from "~/utils/logger";
import BoardCardItem from "../cards/board-list-card-item";
import BoardListEditForm from "./board-list-item-edit-form";

const logger = log.getLogger("BOARD MEMBER SLICE LOGGER");
logger.setLevel(import.meta.env.DEV ? "debug" : "warn");

const BoardListItem = ({
  listId,
  listName,
  boardId,
  token,
  newCardFormActive,
  onCancelCardForm,
}: {
  listId: number;
  listName: string;
  boardId: number;
  token: string | null;
  newCardFormActive: boolean;
  onCancelCardForm: () => void;
}) => {
  const [editBoardListName, setEditBoardListName] = useState(false);
  const recivedCards = useAppSelector((state) => state.cardSlice.cards);
  const dispatch = useAppDispatch();

  const handleListTitleClick = () => {
    setEditBoardListName(true);
  };

  logger.info(`WHAT BOARD ID DOES BOARD-LIST-ITEM RECIEVE ${boardId}`);

  useEffect(() => {
    if (recivedCards.length === 0 && token)
      dispatch(getAllCards({ boardId: boardId, listId: listId, token: token }));
  }, [dispatch, recivedCards]);

  return (
    <div className="board-list-item">
      {editBoardListName ? (
        <BoardListEditForm
          listId={listId}
          listName={listName}
          boardId={boardId}
          setEditFormActive={setEditBoardListName}
        />
      ) : (
        <button onClick={handleListTitleClick}>
          <h2 className="text-4xl">{listName}</h2>
        </button>
      )}
      {recivedCards.map((card) => (
        <div className="board-card-item-container">
          {token && (
            <BoardCardItem
              cardId={card.id}
              cardName={card.name}
              listId={listId}
              boardId={boardId}
              token={token}
              newCardFormActive={newCardFormActive}
              onCancelCardForm={onCancelCardForm}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default BoardListItem;
