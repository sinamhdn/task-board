import cs from "classnames";
import { Link } from "react-router";
import type { BoardRecievedInterface } from "~/state";
import { useAppSelector } from "~/state/hooks";

const BoardDisplayCard = ({
  board,
  handleDeleteBoard,
}: {
  board: BoardRecievedInterface;
  handleDeleteBoard: (board_id: number) => void;
}) => {
  const boardBGList = [
    "bg-gradient-to-r from-red-500/60 to-orange-500/60",
    "bg-gradient-to-r from-amber-500/60 to-yellow-700/60",
    "bg-gradient-to-r from-emerald-400/60 to-cyan-400/60",
    "bg-gradient-to-r from-blue-600/60 to-violet-600/60",
    "bg-gradient-to-r from-purple-500/60 to-purple-900/60",
  ];

  const currentUser = useAppSelector((state) => state.sessionSlice.currentUser);

  return (
    <div
      className={cs(
        "board-card-item text-center rounded-2xl flex flex-col",
        boardBGList[Math.floor(Math.random() * boardBGList.length)],
      )}
      key={board.id}
    >
      <div className="h-full w-full p-5 wrap-break-word bg-white/40 backdrop-blur-md backdrop-saturate-100 border border-white/30 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
        <Link to={`boards/${board.id}`} state={{ board }}>
          <h2 className="text-4xl">{board.name}</h2>
        </Link>
      </div>
      {board.user_id === currentUser?.id ? (
        <button
          className="bg-red-600 text-xs rounded-full cursor-pointer w-fit m-auto mt-3 mb-3 p-1"
          onClick={() => handleDeleteBoard(board.id)}
        >
          Delete Board
        </button>
      ) : (
        <button
          className="bg-gray-400 text-xs rounded-full cursor-pointer w-fit m-auto mt-3 mb-3 p-1"
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
