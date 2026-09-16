import type { RecievedBoardsInterface } from "~/state/boardSlice";

const BoardCardItem = ({ board }: { board: RecievedBoardsInterface }) => {
  return (
    <div className="board-card ">
      <h2 className="text-4xl">{board.name}</h2>
    </div>
  );
};

export default BoardCardItem;
