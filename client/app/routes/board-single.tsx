import { useEffect, useState } from "react";
import { redirect, useLocation, useParams } from "react-router";
import BoardEditForm from "~/components/boards/board-edit-form";
import BoardMembers from "~/components/boards/board-members";
import BoardList from "~/components/lists/board-list";
import BoardListAddButton from "~/components/lists/board-list-item-add-btn";
import BoardListAddForm from "~/components/lists/board-list-item-add-form";
import LoadingSpinner from "~/components/loading-spinner";
import { useWebsocketContext } from "~/providers/websocket-provider";
import { getAllBoardMembers } from "~/state/boardMemberSlice";
import { getBoardById } from "~/state/boardSlice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { getAllLists, resetLists } from "~/state/listSlice";
import { getToken } from "~/utils";
import log from "~/utils/logger";
import type { Route } from "./+types/boardsingle";

const logger = log.getLogger("BOARD MEMBER SLICE LOGGER");
logger.setLevel(import.meta.env.DEV ? "debug" : "warn");

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Single Boards" },
    { name: "description", content: "Single Boards!" },
  ];
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
  const loadedBoardId = useAppSelector((s) => s.listSlice.boardId);
  const lists = useAppSelector((s) => s.listSlice.lists);
  const listsForThisBoard = loadedBoardId === board?.id ? lists : [];

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

  useEffect(() => {
    if (!board || !token) return;
    if (loadedBoardId !== board.id) {
      // refetch whenever board changes
      dispatch(resetLists());
      dispatch(getAllLists({ boardId: board.id, token }));
    }
  }, [board?.id, token, loadedBoardId, dispatch]);

  return (
    <div className="single-board-component">
      {!board || !loggedInUser ? (
        <LoadingSpinner />
      ) : (
        <div>
          <header className="flex justify-between pl-10 text-2xl text-center">
            {editBoardName ? (
              <BoardEditForm
                boardId={board.id}
                boardName={board.name}
                setEditFormActive={setEditBoardName}
              />
            ) : (
              <button onClick={handleBoardTitleClick}>
                <h3>{board.name}</h3>
              </button>
            )}
            <BoardMembers board={board} currentUser={loggedInUser} />
          </header>
          <div className="canvas-wrapper">
            <div className="canvas">
              <div className="lists-wrapper">
                <BoardList
                  list={listsForThisBoard}
                  board={board}
                  token={token}
                />
                {newListFormActive && token && (
                  <BoardListAddForm
                    token={token}
                    board_id={board.id}
                    handleCancelCreateNewListClick={handleCancelCreateNewList}
                  />
                )}
                <BoardListAddButton onClickHandler={handleAddNewListClick} />
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
