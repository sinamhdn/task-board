function BoardCardAddButton({
  onClickHandler,
}: {
  onClickHandler: () => void;
}) {
  return (
    <div className="add-new-list">
      <button
        className="bg-blue-600 text-xs rounded-full cursor-pointer w-fit m-auto mt-3 mb-3 p-1"
        onClick={onClickHandler}
      >
        Add Card
      </button>
    </div>
  );
}

export default BoardCardAddButton;
