import cs from "classnames";
import { Link } from "react-router";
import type { BoardRecievedInterface } from "~/state";
import { useAppSelector } from "~/state/hooks";
import { randomGradientGenerator } from "~/utils";

const BoardDisplayCard = ({
  board,
  handleDeleteBoard,
}: {
  board: BoardRecievedInterface;
  handleDeleteBoard: (board_id: number) => void;
}) => {
  const currentUser = useAppSelector((state) => state.sessionSlice.currentUser);

  return (
    <div
      className={cs(
        "board-card-item text-center rounded-2xl flex flex-col",
        randomGradientGenerator(),
      )}
      key={board.id}
    >
      <div className="h-full w-full p-5 wrap-break-word bg-white/40 backdrop-blur-md backdrop-saturate-100 border border-white/30 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
        <Link to={`boards/${board.id}`} state={{ board }}>
          <h2 className="text-4xl wrap-anywhere">{board.name}</h2>
        </Link>
      </div>
      {board.user_id === currentUser?.id ? (
        <button
          className="bg-red-600/80 hover:bg-red-600 text-xs rounded-full cursor-pointer w-fit m-auto mt-3 mb-3 p-1 px-4 backdrop-blur-md border border-gray-700/30 dark:border-gray-700/20 transition-all duration-200"
          onClick={() => handleDeleteBoard(board.id)}
        >
          Delete Board
        </button>
      ) : (
        <button
          className="bg-gray-400 text-xs rounded-full cursor-pointer w-fit m-auto mt-3 mb-3 p-1 px-4"
          onClick={() => handleDeleteBoard(board.id)}
          disabled
        >
          Delete Board
        </button>
      )}
    </div>
  );
};

export default BoardDisplayCard;
