import { useEffect, useState } from "react";
import { redirect, useLocation, useParams } from "react-router";
import BackgroundImage from "~/components/background-image";
import BoardEditForm from "~/components/boards/board-edit-form";
import BoardMembers from "~/components/boards/board-members";
import BoardList from "~/components/lists/board-list";
import BoardListAddButton from "~/components/lists/board-list-item-add-btn";
import LoadingSpinner from "~/components/loading-spinner";
import { useWebsocketContext } from "~/providers/websocket-provider";
import { getAllBoardMembers } from "~/state/boardMemberSlice";
import { getBoardById } from "~/state/boardSlice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { getToken } from "~/utils";
import log from "~/utils/logger";
import type { Route } from "./+types/boardsingle";

import bg from "~/assets/single-board-bg.webp";

const logger = log.getLogger("BOARD-SINGLE LOGGER");
logger.setLevel(import.meta.env.DEV ? "debug" : "warn");

export function meta({ matches }: Route.MetaArgs) {
  // Find the root match
  const rootMatch = matches.find((match) => match?.id === "root");
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

function BoardSingle() {
  const [editBoardName, setEditBoardName] = useState(false);
  const [newListFormActive, setNewListFormActive] = useState(false);
  const { id: urlParamBoardId } = useParams();
  const { board: locationBoard } = useLocation().state ?? {};
  const { isConnected, sendMessage } = useWebsocketContext();
  const token = getToken();
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
  const loggedInUser = useAppSelector(
    (state) => state.sessionSlice.currentUser,
  );

  const dispatch = useAppDispatch();

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

  useEffect(() => {
    if (!token) throw redirect("signin");
    if (!board && urlParamBoardId)
      dispatch(
        getBoardById({ boardId: Number(urlParamBoardId), token: token }),
      );
  }, [token, board, urlParamBoardId, dispatch]);

  useEffect(() => {
    if (!token) throw redirect("signin");
    logger.info(`IS GET ALL BOARD MEMBERS CALLED: ${board && !boardMembers}`);
    logger.info(
      `WHAT IS INSIDE BOARDMEMBER: ${boardMembers} and board: ${board}`,
    );
    logger.info(
      `T/F BOARDMEMBER: ${Boolean(boardMembers)} and board: ${Boolean(board)}`,
    );
    if (board && boardMembers.length === 0) {
      dispatch(getAllBoardMembers({ boardId: board.id, token: token }));
    }
  }, [token, board, boardMembers, dispatch]);

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
              <BoardMembers board={board} currentUser={loggedInUser} />
            </div>
            {editBoardName ? (
              <div className="md:w-1/2 md:px-0 px-2 m-auto">
                <BoardEditForm
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
