import type { Route } from "./+types/boardnew";

import BoardAddForm from "~/components/boards/board-add-form";
import { useAddNewBoardForm } from "~/providers/board-add-provider";
import BoardAddButton from "./board-add-button";
// import BoardAddButton from "~/components/board-add-button";

function BoardNew({ token }: { token: string }) {
  const { showAddNewBoardForm } = useAddNewBoardForm();

  return (
    <div className="board-new container mx-auto">
      {/* {showAddNewBoardForm && <BoardAddForm />} */}
      {showAddNewBoardForm ? (
        <BoardAddForm token={token} />
      ) : (
        <BoardAddButton />
      )}
    </div>
  );
}

export default BoardNew;
