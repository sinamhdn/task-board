import BoardListAddForm from "./board-list-item-add-form";

function BoardListAddButton({
  newListFormActive,
  boardId,
  token,
  onClickHandler,
  onCancelHandler,
}: {
  newListFormActive: boolean;
  boardId: number;
  token: string | null;
  onClickHandler: () => void;
  onCancelHandler: () => void;
}) {
  return (
    <div className="add-new-list text-xl p-5 w-full xl:w-1/2">
      <button onClick={onClickHandler} className="cursor-pointer">
        + Add new list...
      </button>
      {newListFormActive && token && (
        <BoardListAddForm
          token={token}
          board_id={boardId}
          handleCancelCreateNewListClick={onCancelHandler}
        />
      )}
    </div>
  );
}

export default BoardListAddButton;
