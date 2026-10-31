import type { BoardRecievedInterface, ListRecievedInterface } from "~/state";
import BoardListItem from "./board-list-item";
import BoardListDeleteButton from "./board-list-item-delete-btn";

const BoardList = ({
  token,
  board,
  list,
}: {
  token: string | null;
  board: BoardRecievedInterface;
  list: ListRecievedInterface[];
}) => {
  return (
    <div className="board-list-item">
      <ul>
        {list.map((item: any) => (
          <li key={item.id}>
            <BoardListItem
              id={item.id}
              name={item.name}
              boardId={item.boardId}
            />
            <BoardListDeleteButton
              board={board}
              listId={item.id}
              token={token}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BoardList;
