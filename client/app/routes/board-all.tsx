import classnames from "classnames";
import { useEffect } from "react";
import { redirect } from "react-router";
import BoardCard from "~/components/board-card";
import BoardNew from "~/components/board-new";
import LoadingSpinner from "~/components/loading-spinner";
import {
  LoadingStatus as BoardLoadingStatusEnum,
  deleteBoard,
  getAllBoards,
} from "~/state/boardSlice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { getToken } from "~/utils";
import type { Route } from "./+types/board-all";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "All Boards" },
    { name: "description", content: "All Boards!" },
  ];
}

function BoardAll() {
  const token = getToken();
  const dispatch = useAppDispatch();
  const boards = useAppSelector((state) => state.board.boards);
  const getBoardsLoadingStatus = useAppSelector(
    (state) => state.board.getBoardsLoadingStatus,
  );

  const iconClasses = classnames({
    fa: true,
    "fa-user": getBoardsLoadingStatus !== BoardLoadingStatusEnum.pending,
    "fa-spinner": getBoardsLoadingStatus === BoardLoadingStatusEnum.pending,
    "fa-spin": getBoardsLoadingStatus === BoardLoadingStatusEnum.pending,
  });

  useEffect(() => {
    if (!token) throw redirect("signin");
    dispatch(getAllBoards({ token }));
  }, [token]);

  useEffect(() => {
    console.log("boards returned.", boards);
  }, [boards]);

  // Show loading state first
  if (getBoardsLoadingStatus === BoardLoadingStatusEnum.pending) {
    return <LoadingSpinner spinnerIconClasses={iconClasses} />;
  }

  // Show empty state
  if (boards.length === 0) {
    return (
      <div className="all-boards-component">
        <p>No Boards Available!</p>
        <BoardNew />
      </div>
    );
  }

  function handleDeleteBoard(board_id: number) {
    if (!token) return;
    console.log("deleteBoard value:", deleteBoard);
    dispatch(deleteBoard({ token: token, board_id: board_id }));
  }

  // Show boards
  return (
    <div className="all-boards-component container mx-auto text-center">
      <div className="board-new-button-container bg-blue-700">
        <BoardNew />
      </div>
      {boards.length > 0 && (
        <section className="board-card-list">
          <h3 className="mt-4 mb-4 text-4xl">My boards</h3>
          <div className="my-boards-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xl">
            {boards.map((board) => (
              <BoardCard board={board} handleDeleteBoard={handleDeleteBoard} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default BoardAll;
