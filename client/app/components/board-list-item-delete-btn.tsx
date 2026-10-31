import type { BoardRecievedInterface } from "~/state";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { deleteList } from "~/state/listSlice";

function BoardListDeleteButton({
  board,
  listId,
  token,
}: {
  board: BoardRecievedInterface;
  listId: number;
  token: string | null;
}) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.sessionSlice.currentUser);

  const handleDeleteList = (
    board: BoardRecievedInterface,
    listId: number,
    token: string | null,
  ) => {
    if (token !== null)
      dispatch(deleteList({ boardId: board.id, listId: listId, token: token }));
  };

  return (
    <div className="delete-list-btn">
      {board.user_id === currentUser?.id ? (
        <button
          className="bg-red-600 text-xs rounded-full cursor-pointer w-fit m-auto mt-3 mb-3 p-1"
          onClick={() => handleDeleteList(board, listId, token)}
        >
          Delete List
        </button>
      ) : (
        <button
          className="bg-gray-400 text-xs rounded-full cursor-pointer w-fit m-auto mt-3 mb-3 p-1"
          onClick={() => handleDeleteList(board, listId, token)}
          disabled
        >
          Delete List
        </button>
      )}
    </div>
  );
}

export default BoardListDeleteButton;
