import type { Route } from "./+types/boardnew";

import BoardAddForm from "~/components/boards/board-add-form";
import { useAddNewBoardForm } from "~/providers/board-add-provider";
// import BoardAddButton from "~/components/board-add-button";

function BoardNew() {
  const { showAddNewBoardForm } = useAddNewBoardForm();

  return (
    <div className="board-new container mx-auto">
      {showAddNewBoardForm && <BoardAddForm />}
      {/* {showAddNewBoardForm ? <BoardAddForm /> : <BoardAddButton />} */}
    </div>
  );
}

export default BoardNew;
