import cs from "classnames";
import { useEffect, useState } from "react";
import { LoadingStatusEnum, type BoardRecievedInterface } from "~/state";
import { getAllCards } from "~/state/cardSlice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { randomGradientGenerator } from "~/utils";
import log from "~/utils/logger";
import BoardCardAddForm from "../cards/board-list-card-add-form";
import BoardCardItem from "../cards/board-list-card-item";
import BoardListEditForm from "./board-list-item-edit-form";

const logger = log.getLogger("BOARD MEMBER SLICE LOGGER");
logger.setLevel(import.meta.env.DEV ? "debug" : "warn");

const BoardListItem = ({
  listId,
  listName,
  board,
  token,
  newCardFormActive,
  onCancelCardForm,
}: {
  listId: number;
  listName: string;
  board: BoardRecievedInterface;
  token: string | null;
  newCardFormActive: boolean;
  onCancelCardForm: () => void;
}) => {
  const [editBoardListName, setEditBoardListName] = useState(false);
  const recivedCards = useAppSelector(
    (state) => state.cardSlice.cardsByList[listId] ?? [],
  );
  const cardsLoadStatus = useAppSelector(
    (state) => state.cardSlice.getAllCardsLoadingStatusByList[listId],
  );

  const dispatch = useAppDispatch();

  const handleListTitleClick = () => {
    setEditBoardListName(true);
  };

  logger.info(`WHAT BOARD ID DOES BOARD-LIST-ITEM RECIEVE ${board.id}`);

  useEffect(() => {
    if (token && cardsLoadStatus == null) {
      dispatch(
        getAllCards({ boardId: board.id, listId: listId, token: token }),
      );
    }
  }, [dispatch, token, board.id, listId, cardsLoadStatus]);

  return (
    <div
      className={cs(
        "board-list-item rounded-md mx-3 px-5 pb-5",
        randomGradientGenerator(),
      )}
    >
      {editBoardListName ? (
        <BoardListEditForm
          listId={listId}
          listName={listName}
          boardId={board.id}
          setEditFormActive={setEditBoardListName}
        />
      ) : (
        <button onClick={handleListTitleClick}>
          <h2 className="text-4xl py-5 w-full wrap-anywhere text-left">
            {listName}
          </h2>
        </button>
      )}
      <ul>
        {cardsLoadStatus === LoadingStatusEnum.fulfilled &&
          recivedCards.map((card) => (
            <li className="board-card-item-container" key={card.id}>
              {token && (
                <BoardCardItem
                  cardId={card.id}
                  cardName={card.name}
                  listId={listId}
                  board={board}
                  token={token}
                />
              )}
            </li>
          ))}
      </ul>
      <div className="card-add-form-container relative top-0">
        {newCardFormActive && token && (
          <BoardCardAddForm
            boardId={board.id}
            listId={listId}
            token={token}
            handleCancelAddNewCardClick={onCancelCardForm}
          />
        )}
      </div>
    </div>
  );
};

export default BoardListItem;
