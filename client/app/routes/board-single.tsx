import type { Route } from "./+types/boardsingle";
import BoardMembers from "~/components/board-members";
import { useEffect } from "react";
import { redirect, useLocation, useParams } from "react-router";
import LoadingSpinner from "~/components/loading-spinner";
import BoardAddNewList from "~/components/board-add-new-list";
import { useWebsocketContext } from "~/providers/websocket-provider";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { getBoardById } from "~/state/boardSlice";
import { getToken } from "~/utils";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Single Boards" },
    { name: "description", content: "Single Boards!" },
  ];
}

function BoardSingle() {
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
            <h3>{board.name}</h3>
            {loggedInUser.id === board.user_id && (
              <BoardMembers board={board} currentUser={loggedInUser} />
            )}
          </header>
          <div className="canvas-wrapper">
            <div className="canvas">
              <div className="lists-wrapper">
                <BoardAddNewList />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BoardSingle;
