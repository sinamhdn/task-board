import type { Route } from "./+types/boardnew";

import BoardAddForm from "~/components/board-add-form";
// import BoardAddButton from "~/components/board-add-button";
import { useAddNewBoardForm } from "~/providers/board-add-provider";

function BoardNew() {
  const { showAddNewBoardForm } = useAddNewBoardForm();

  return (
    <div className="board-new container mx-auto">
      {/* {showAddNewBoardForm ? <BoardAddForm /> : <BoardAddButton />} */}
      {showAddNewBoardForm && <BoardAddForm />}
    </div>
  );
}

export default BoardNew;
