import type { BoardRecievedInterface } from "~/state";
import { deleteCard } from "~/state/cardSlice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";

function BoardCardDeleteButton({
  board,
  listId,
  cardId,
  token,
}: {
  board: BoardRecievedInterface;
  listId: number;
  cardId: number;
  token: string | null;
}) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.sessionSlice.currentUser);

  const handleDeleteCard = (
    board: BoardRecievedInterface,
    listId: number,
    cardId: number,
    token: string | null,
  ) => {
    if (token !== null)
      dispatch(
        deleteCard({
          boardId: board.id,
          listId: listId,
          cardId: cardId,
          token: token,
        }),
      );
  };

  return (
    <div className="delete-list-btn">
      {board.user_id === currentUser?.id ? (
        <button
          className="bg-red-600 text-xs rounded-full cursor-pointer w-fit m-auto mt-3 mb-3 p-1"
          onClick={() => handleDeleteCard(board, listId, cardId, token)}
        >
          Delete List
        </button>
      ) : (
        <button
          className="bg-gray-400 text-xs rounded-full cursor-pointer w-fit m-auto mt-3 mb-3 p-1"
          onClick={() => handleDeleteCard(board, listId, cardId, token)}
          disabled
        >
          Delete List
        </button>
      )}
    </div>
  );
}

export default BoardCardDeleteButton;
