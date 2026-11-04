function BoardListAddButton({
  onClickHandler,
}: {
  onClickHandler: () => void;
}) {
  return (
    <div className="add-new-list">
      <button onClick={onClickHandler}>Add list</button>
    </div>
  );
}

export default BoardListAddButton;
