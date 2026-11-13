import classnames from "classnames";
import { useEffect } from "react";
import { redirect } from "react-router";
import BackgroundImage from "~/components/background-image";
import BoardNew from "~/components/boards/board-new";
import LoadingSpinner from "~/components/loading-spinner";
import { LoadingStatusEnum } from "~/state";
import { deleteBoard, getAllBoards } from "~/state/boardSlice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { getToken } from "~/utils";
import type { Route } from "./+types/board-all";

import bg from "~/assets/all-boards-bg.webp";
import BoardDisplayCard from "~/components/boards/board-display-card";

export function meta({ matches }: Route.MetaArgs) {
  // Find the root match
  const rootMatch = matches.find((match) => match?.id === "root");
  // Extract the root's meta descriptors (if any)
  const rootMeta = rootMatch?.meta ?? [];
  // Define this route's meta
  const pageMeta = [
    { title: "All Boards" },
    { name: "description", content: "All Boards!" },
  ];
  // Merge: root first, then page-specific (page wins on duplicates)
  return [...rootMeta, ...pageMeta];
}

function BoardAll() {
  const token = getToken();
  const dispatch = useAppDispatch();
  const boards = useAppSelector((state) => state.boardSlice.boards);
  const getAllBoardsLoadingStatus = useAppSelector(
    (state) => state.boardSlice.getAllBoardsLoadingStatus,
  );

  const iconClasses = classnames({
    fa: true,
    "fa-user": getAllBoardsLoadingStatus !== LoadingStatusEnum.pending,
    "fa-spinner": getAllBoardsLoadingStatus === LoadingStatusEnum.pending,
    "fa-spin": getAllBoardsLoadingStatus === LoadingStatusEnum.pending,
  });

  useEffect(() => {
    if (!token) throw redirect("signin");
    dispatch(getAllBoards({ token }));
  }, [token]);

  useEffect(() => {
    console.log("boards returned.", boards);
  }, [boards]);

  // Show loading state first
  if (getAllBoardsLoadingStatus === LoadingStatusEnum.pending) {
    return <LoadingSpinner spinnerIconClasses={iconClasses} />;
  }

  // Show empty state
  if (boards.length === 0) {
    return (
      <div className="all-boards-component">
        <BackgroundImage src={bg} alt="Nature Background Image" />
        <p>No Boards Available!</p>
        <BoardNew />
      </div>
    );
  }

  function handleDeleteBoard(board_id: number) {
    if (!token) return;
    console.log("deleteBoard value:", deleteBoard);
    dispatch(deleteBoard({ token: token, boardId: board_id }));
  }

  // Show boards
  return (
    <div className="all-boards-component container mx-auto text-center">
      <BackgroundImage src={bg} alt="Nature Background Image" />
      <div className="board-new-button-container ">
        <BoardNew />
      </div>
      {boards.length > 0 && (
        <section className="board-card-list">
          <h3 className="mt-4 mb-4 text-4xl bg-gray-300 dark:bg-gray-700 pt-1 pb-1">
            MY BOARDS
          </h3>
          <div className="my-boards-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xl px-2 items-start">
            {boards.map((board) => (
              <BoardDisplayCard
                board={board}
                handleDeleteBoard={handleDeleteBoard}
                key={board.id}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default BoardAll;
