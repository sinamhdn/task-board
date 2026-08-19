import { useAddNewBoardForm } from "~/providers/board-add-provider";

function BoardAddButton() {
  const { handleAddNewBoardClick } = useAddNewBoardForm();
  return (
    <div className="board-add-button-component">
      <button
        className="w-full pt-2 pb-2 cursor-pointer"
        onClick={handleAddNewBoardClick}
      >
        New board
      </button>
    </div>
  );
}

export default BoardAddButton;
