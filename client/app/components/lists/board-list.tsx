import { useEffect, useState } from "react";
import type { BoardRecievedInterface, ListRecievedInterface } from "~/state";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { getAllLists, resetLists } from "~/state/listSlice";
import log from "~/utils/logger";
import BoardCardAddButton from "../cards/board-list-card-add-btn";
import BoardListItem from "./board-list-item";
import BoardListDeleteButton from "./board-list-item-delete-btn";
const logger = log.getLogger("BOARD-LIST LOGGER");
logger.setLevel(import.meta.env.DEV ? "debug" : "warn");

const BoardList = ({
  token,
  board,
}: {
  token: string | null;
  board: BoardRecievedInterface;
}) => {
  const dispatch = useAppDispatch();

  const loadedBoardId = useAppSelector((state) => state.listSlice.boardId);
  const lists = useAppSelector((s) => s.listSlice.lists);
  const listsForThisBoard = loadedBoardId === board?.id ? lists : [];

  const [newCardFormActive, setNewCardFormActive] = useState(false);

  const handleAddNewCardClick = () => {
    if (newCardFormActive) {
      setNewCardFormActive(false);
      return;
    }
    setNewCardFormActive(true);
  };

  const [activeCardFormListId, setActiveCardFormListId] = useState<
    number | null
  >(null);

  const toggleCardForm = (listId: number) => {
    setActiveCardFormListId((prev) => (prev === listId ? null : listId));
  };

  useEffect(() => {
    if (!board || !token) return;
    if (loadedBoardId !== board.id) {
      // refetch whenever board changes
      dispatch(resetLists());
      dispatch(getAllLists({ boardId: board.id, token }));
    }
  }, [board?.id, token, loadedBoardId, dispatch]);

  logger.info(
    "LISTS RECIEVED FROM SERVER:: ",
    listsForThisBoard,
    " LOADEDBOARDID:: ",
    loadedBoardId,
  );

  return (
    <div className="board-list-item">
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {listsForThisBoard.map((item: ListRecievedInterface) => (
          <li key={item.id}>
            <BoardListItem
              listId={item.id}
              listName={item.name}
              board={board}
              token={token}
              newCardFormActive={activeCardFormListId === item.id}
              onCancelCardForm={() => setActiveCardFormListId(null)}
            />
            <div className="list-btn-container flex justify-center">
              <BoardCardAddButton
                onClickHandler={() => toggleCardForm(item.id)}
              />
              <BoardListDeleteButton
                board={board}
                listId={item.id}
                token={token}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BoardList;
