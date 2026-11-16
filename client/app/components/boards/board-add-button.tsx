import { useAddNewBoardForm } from "~/providers/board-add-provider";

function BoardAddButton() {
  const { handleAddNewBoardClick } = useAddNewBoardForm();
  return (
    <div className="board-add-button-component">
      <button
        className="w-full cursor-pointer"
        onClick={handleAddNewBoardClick}
      >
        Add board
      </button>
    </div>
  );
}

export default BoardAddButton;
