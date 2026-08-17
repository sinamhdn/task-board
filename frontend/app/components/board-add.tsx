function BoardAdd({ handleAddNewClick }: { handleAddNewClick: () => void }) {
  return (
    <div className="board-add-button-component">
      <button onClick={handleAddNewClick}>Add new board</button>
    </div>
  );
}

export default BoardAdd;
