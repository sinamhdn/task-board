import { Link } from "react-router";
import type { RecievedBoardsInterface } from "~/state/boardSlice";

const BoardCard = ({
  board,
  handleDeleteBoard,
}: {
  board: RecievedBoardsInterface;
  handleDeleteBoard: (board_id: number) => void;
}) => {
  return (
    <div
      className="board-card-item bg-fuchsia-700 text-center rounded-sm flex flex-col pt-2"
      key={board.id}
    >
      <Link to={`boards/${board.id}`} state={{ board }}>
        <h2 className="text-4xl">{board.name}</h2>
      </Link>
      <button
        className="bg-red-600 text-xs w-full rounded-b-sm mt-2 cursor-pointer"
        onClick={() => handleDeleteBoard(board.id)}
      >
        Delete
      </button>
    </div>
  );
};

export default BoardCard;
