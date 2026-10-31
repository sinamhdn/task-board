import { useState } from "react";
import BoardListEditForm from "./board-list-edit-form";

const BoardListItem = ({
  id,
  name,
  boardId,
}: {
  id: number;
  name: string;
  boardId: number;
}) => {
  const [editBoardListName, setEditBoardListName] = useState(false);

  const handleListTitleClick = () => {
    setEditBoardListName(true);
  };

  return (
    <div className="board-list-item">
      {editBoardListName ? (
        <BoardListEditForm
          listId={id}
          listName={name}
          boardId={boardId}
          setEditFormActive={setEditBoardListName}
        />
      ) : (
        <button onClick={handleListTitleClick}>
          <h2 className="text-4xl">{name}</h2>
        </button>
      )}
    </div>
  );
};

export default BoardListItem;
