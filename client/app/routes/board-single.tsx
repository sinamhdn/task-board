import { useEffect, useState } from "react";
import { redirect, useLocation, useParams } from "react-router";
import BoardEditForm from "~/components/board-edit-form";
import BoardListAddButton from "~/components/board-list-add-btn";
import BoardMembers from "~/components/board-members";
import LoadingSpinner from "~/components/loading-spinner";
import { useWebsocketContext } from "~/providers/websocket-provider";
import { getBoardById } from "~/state/boardSlice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { getToken } from "~/utils";
import type { Route } from "./+types/boardsingle";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Single Boards" },
    { name: "description", content: "Single Boards!" },
  ];
}

function BoardSingle() {
  const [editBoardName, setEditBoardName] = useState(false);
  const { id: urlParamBoardId } = useParams();
  const { board: locationBoard } = useLocation().state ?? {};
  const { isConnected, sendMessage } = useWebsocketContext();
  const token = getToken();

  const board = useAppSelector((state) => {
    if (locationBoard)
      return state.board.boards.find((board) => board.id === locationBoard.id);
    return state.board.boards.find(
      (board) => board.id === Number(urlParamBoardId),
    );
  });

  const loggedInUser = useAppSelector((state) => state.session.currentUser);

  const dispatch = useAppDispatch();

  const handleBoardTitleClick = () => {
    setEditBoardName(true);
  };

  useEffect(() => {
    if (!token) throw redirect("signin");
    if (!board && urlParamBoardId)
      dispatch(
        getBoardById({ boardId: Number(urlParamBoardId), token: token }),
      );
  }, [token, board, urlParamBoardId, dispatch]);

  useEffect(() => {
    if (!isConnected || !urlParamBoardId) return;

    sendMessage({
      action: "subscribe",
      channel: `boards:${urlParamBoardId}`,
    });
  }, [isConnected, urlParamBoardId, sendMessage]);

  return (
    <div className="single-board-component">
      {!board || !loggedInUser ? (
        <LoadingSpinner />
      ) : (
        <div>
          <header className="flex justify-between">
            {editBoardName ? (
              <BoardEditForm
                boardId={board.id}
                setEditFormActive={setEditBoardName}
              />
            ) : (
              <button onClick={handleBoardTitleClick}>
                <h3>{board.name}</h3>
              </button>
            )}
            {loggedInUser.id === board.user_id && (
              <BoardMembers board={board} currentUser={loggedInUser} />
            )}
          </header>
          <div className="canvas-wrapper">
            <div className="canvas">
              <div className="lists-wrapper">
                <BoardListAddButton />
                <ul className="board-lists"></ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BoardSingle;
