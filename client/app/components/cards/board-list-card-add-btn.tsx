function BoardCardAddButton({
  onClickHandler,
}: {
  onClickHandler: () => void;
}) {
  return (
    <div className="add-new-list mx-1">
      <button
        className="bg-blue-600 text-md rounded-full cursor-pointer w-fit m-auto mt-3 mb-3 py-2 px-10"
        onClick={onClickHandler}
      >
        Add Card
      </button>
    </div>
  );
}

export default BoardCardAddButton;
