import { useState } from "react";
import type { Route } from "./+types/boardnew";

import BoardForm from "~/components/board-form";
import BoardAdd from "~/components/board-add-button";

function BoardNew() {
  const [showForm, setShowForm] = useState(false);

  function handleAddNewClick() {
    setShowForm(true);
  }

  function handleCancelClick() {
    setShowForm(false);
  }

  return (
    <div className="board-new">
      {showForm ? (
        <BoardForm handleCancelClick={handleCancelClick} />
      ) : (
        <BoardAdd handleAddNewClick={handleAddNewClick} />
      )}
    </div>
  );
}

export default BoardNew;
