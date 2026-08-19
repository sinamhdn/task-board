function BoardAdd({ handleAddNewClick }: { handleAddNewClick: () => void }) {
  return (
    <div className="board-add-button-component">
      <button
        className="w-full pt-2 pb-2 bg-blue-700 cursor-pointer"
        onClick={handleAddNewClick}
      >
        Add new board
      </button>
    </div>
  );
}

export default BoardAdd;
