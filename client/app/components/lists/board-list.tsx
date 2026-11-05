import { useState } from "react";
import type { BoardRecievedInterface, ListRecievedInterface } from "~/state";
import log from "~/utils/logger";
import BoardCardAddButton from "../cards/board-list-card-add-btn";
import BoardListItem from "./board-list-item";
import BoardListDeleteButton from "./board-list-item-delete-btn";
const logger = log.getLogger("BOARD MEMBER SLICE LOGGER");
logger.setLevel(import.meta.env.DEV ? "debug" : "warn");

const BoardList = ({
  token,
  board,
  list,
}: {
  token: string | null;
  board: BoardRecievedInterface;
  list: ListRecievedInterface[];
}) => {
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

  return (
    <div className="board-list-item">
      <ul>
        {list.map((item: any) => (
          <li key={item.id}>
            <BoardListItem
              listId={item.id}
              listName={item.name}
              boardId={item.board_id}
              token={token}
              newCardFormActive={activeCardFormListId === item.id}
              onCancelCardForm={() => setActiveCardFormListId(null)}
            />
            <div className="list-btn-container flex">
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
