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

  return (
    <div className="board-list-item">
      <ul>
        {list.map((item: any) => (
          <li key={item.id}>
            <BoardListItem
              id={item.id}
              name={item.name}
              boardId={item.board_id}
            />
            <div className="list-btn-container flex">
              <BoardCardAddButton onClickHandler={handleAddNewCardClick} />
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
