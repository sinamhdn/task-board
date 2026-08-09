import type { RecievedBoardsInterface } from "~/state/boardSlice";

const BoardCard = ({ board }: { board: RecievedBoardsInterface }) => {
  return (
    <div className="board-card ">
      <h2>{board.name}</h2>
    </div>
  );
};

export default BoardCard;
