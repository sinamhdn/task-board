import { useAppDispatch, useAppSelector } from "~/state/hooks";
import type { Route } from "./+types/board-all";
import { useEffect } from "react";
import {
  getAllBoards,
  LoadingStatus as BoardLoadingStatusEnum,
} from "~/state/boardSlice";
import { getToken } from "~/utils";
import classnames from "classnames";
import BoardCard from "~/components/board-card";
import BoardNew from "~/components/board-new";

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
    if (!token) return;
    dispatch(getAllBoards({ token }));
  }, [token]);

  useEffect(() => {
    console.log("boards returned.", boards);
  }, [boards]);

  // Show loading state first
  if (getBoardsLoadingStatus === BoardLoadingStatusEnum.pending) {
    return (
      <section>
        <h3>
          <i className={iconClasses} />
        </h3>
      </section>
    );
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

  // Show boards
  return (
    <div className="all-boards-component container mx-auto text-center">
      <div className="board-new-button-container mt-2 mb-2 bg-blue-700 p-2">
        <BoardNew />
      </div>
      {boards.length > 0 && (
        <section className="board-card-list">
          <h3 className="mt-4 mb-4 text-4xl">My boards</h3>
          <div className="my-boards-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xl">
            {boards.map((board) => (
              <div className="board-list-item bg-fuchsia-700 pt-2 pb-2 text-center rounded-sm">
                <BoardCard key={board.id} board={board} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default BoardAll;
