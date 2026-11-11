function BoardListAddButton({
  onClickHandler,
}: {
  onClickHandler: () => void;
}) {
  return (
    <div className="add-new-list text-xl p-5 w-xs">
      <button onClick={onClickHandler} className="cursor-pointer">
        + Add new list...
      </button>
    </div>
  );
}

export default BoardListAddButton;
