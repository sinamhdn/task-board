import { useEffect, useState } from "react";
import {
  redirect,
  // replace,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import BackgroundImage from "~/components/background-image";
import BoardEditForm from "~/components/boards/board-edit-form";
import BoardMembers from "~/components/boards/board-members";
import BoardList from "~/components/lists/board-list";
import BoardListAddButton from "~/components/lists/board-list-item-add-btn";
import LoadingSpinner from "~/components/loading-spinner";
import { useWebsocketContext } from "~/providers/websocket-provider";
import { getAllBoardMembers } from "~/state/board-member-slice";
import { getBoardById } from "~/state/board-slice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { getTokenCookie } from "~/utils";
import log from "~/utils/logger";
import type { Route } from "./+types/boardsingle";

import bg from "~/assets/single-board-bg.webp";
import { LoadingStatusEnum } from "~/state";
import { getTokenCookieFromRequest } from "~/utils/auth";

const logger = log.getLogger("board-single logger");
logger.setLevel(import.meta.env.DEV ? "debug" : "warn");

export function meta({ matches }: Route.MetaArgs) {
  // Find the root match
  const rootMatch = matches.find((match: any) => match?.id === "root");
  // Extract the root's meta descriptors (if any)
  const rootMeta = rootMatch?.meta ?? [];
  // Define this route's meta
  const pageMeta = [
    { title: "Single Boards" },
    { name: "description", content: "Single Boards!" },
  ];
  // Merge: root first, then page-specific (page wins on duplicates)
  return [...rootMeta, ...pageMeta];
}

// In React, if you pass value, React treats that prop as the single source of truth
// When you type, the browser tries to change the input, but React immediately re-renders it back to myValue. Since myValue never changes, the input looks read-only. React will usually warn:
// You provided a value prop to a form field without an onChange handler. This will render a read-only field.
// Fix 1: Make it controlled properly
// Add state and update it in onChange
// Fix 2: If you only want an initial value
// Use defaultValue instead of value

export async function loader({ request, params }: Route.LoaderArgs) {
  const token = getTokenCookieFromRequest(request);
  if (!token) throw redirect("/signin");
  return null;
}

function BoardSingle() {
  const [editBoardName, setEditBoardName] = useState(false);
  const [newListFormActive, setNewListFormActive] = useState(false);
  const { id: urlParamBoardId } = useParams();
  const { board: locationBoard } = useLocation().state ?? {};
  const { isConnected, sendMessage } = useWebsocketContext();
  const token = getTokenCookie();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const board = useAppSelector((state) => {
    if (locationBoard)
      return state.boardSlice.boards.find(
        (board) => board.id === locationBoard.id,
      );
    return state.boardSlice.boards.find(
      (board) => board.id === Number(urlParamBoardId),
    );
  });
  const boardMembers = useAppSelector((state) => {
    return state.boardMemberSlice.boardMembers;
  });
  const boardMembersBoardId = useAppSelector((state) => {
    return state.boardMemberSlice.boardId;
  });
  const boardMembersLoadingStatus = useAppSelector(
    (state) => state.boardMemberSlice.getAllBoardMembersLoadingStatus,
  );
  const loggedInUser = useAppSelector(
    (state) => state.sessionSlice.currentUser,
  );

  const handleBoardTitleClick = () => {
    setEditBoardName(true);
  };

  const handleAddNewListClick = () => {
    if (newListFormActive) {
      setNewListFormActive(false);
      return;
    }
    setNewListFormActive(true);
  };

  const handleCancelCreateNewList = () => {
    setNewListFormActive(false);
  };

  // Fetch the board (guard: only if not already in store)
  useEffect(() => {
    if (!token || !urlParamBoardId || board) return;
    dispatch(getBoardById({ boardId: Number(urlParamBoardId), token: token }));
  }, [token, board, urlParamBoardId, dispatch]);

  // Fetch members for THIS board, regardless of what's in the slice
  useEffect(() => {
    logger.info(
      "board-single: is getAllBoardMembers dispatched -> ",
      board && !boardMembers,
    );
    logger.info("board-single: boardMember = ", boardMembers);
    logger.info("board-single: board = ", board);
    logger.info("board-single: Boolean(boardMember) = ", Boolean(boardMembers));
    logger.info("board-single: Boolean(board) = ", Boolean(board));
    if (!token || !board) return;
    if (boardMembersBoardId === board.id) return;
    dispatch(getAllBoardMembers({ boardId: board.id, token: token }));
  }, [token, board, boardMembersLoadingStatus, dispatch]);

  // Authorize ONLY after everything is ready
  useEffect(() => {
    if (!board || !loggedInUser) return;
    if (boardMembersLoadingStatus !== LoadingStatusEnum.fulfilled) return;
    if (boardMembersBoardId !== board.id) return;
    const userId = loggedInUser.id;
    const isOwner = String(board.user_id) === String(userId);
    const isMember = boardMembers.some(
      (member) => String(member.id) === String(userId),
    );
    logger.info('board-single: redirected to "/"');
    if (isOwner || isMember) return;
    navigate("/", { replace: true });
  }, [
    board,
    loggedInUser,
    boardMembers,
    boardMembersLoadingStatus,
    boardMembersBoardId,
    navigate,
  ]);

  useEffect(() => {
    if (!isConnected || !urlParamBoardId) return;

    sendMessage({
      action: "subscribe",
      channel: `boards:${urlParamBoardId}`,
    });
  }, [isConnected, urlParamBoardId, sendMessage]);

  return (
    <div className="single-board-component">
      <BackgroundImage src={bg} alt="Coast Background Image" />
      {!board || !loggedInUser ? (
        <LoadingSpinner />
      ) : (
        <div>
          <header className="md:pl-10 text-2xl text-center w-full md:w-1/0.5 m-auto">
            <div className="flex justify-center md:absolute md:right-0 md:top-25">
              <BoardMembers
                token={token}
                board={board}
                currentUser={loggedInUser}
              />
            </div>
            {editBoardName ? (
              <div className="md:w-1/2 md:px-0 px-2 m-auto">
                <BoardEditForm
                  token={token}
                  boardId={board.id}
                  boardName={board.name}
                  setEditFormActive={setEditBoardName}
                />
              </div>
            ) : (
              <button
                onClick={handleBoardTitleClick}
                className="w-full px-2 md:w-1/2 md:px-0"
              >
                <h3 className="mt-4 mb-4 text-4xl dark:border-b-gray-300 border-b-gray-700 border-b-2 bg-gray-300 dark:bg-gray-700 pt-1 pb-1 wrap-anywhere w-full m-auto">
                  {board.name}
                </h3>
              </button>
            )}
          </header>
          <div className="canvas-wrapper">
            <div className="canvas">
              <div className="lists-wrapper">
                <div className="flex justify-center text-center">
                  <BoardListAddButton
                    newListFormActive={newListFormActive}
                    boardId={board.id}
                    token={token}
                    onClickHandler={handleAddNewListClick}
                    onCancelHandler={handleCancelCreateNewList}
                  />
                </div>
                <BoardList board={board} token={token} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BoardSingle;
