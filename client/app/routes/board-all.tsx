import classnames from "classnames";
import { useEffect } from "react";
import { redirect } from "react-router";
import BackgroundImage from "~/components/background-image";
import BoardNew from "~/components/boards/board-new";
import LoadingSpinner from "~/components/loading-spinner";
import { LoadingStatusEnum } from "~/state";
import { deleteBoard, getAllBoards } from "~/state/board-slice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { getTokenCookie } from "~/utils";
import type { Route } from "./+types/board-all";

import bg from "~/assets/all-boards-bg.webp";
import BoardDisplayCard from "~/components/boards/board-display-card";
import { useWebsocketContext } from "~/providers/websocket-provider";
import { getTokenCookieFromRequest } from "~/utils/auth";

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

export async function loader({ request, params }: Route.LoaderArgs) {
  const token = getTokenCookieFromRequest(request);
  if (!token) throw redirect("/signin");
  return null;
}

function BoardAll() {
  const token = getTokenCookie();
  const dispatch = useAppDispatch();
  const boards = useAppSelector((state) => state.boardSlice.boards);
  const { isConnected, sendMessage } = useWebsocketContext();
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
    if (!token) return;
    dispatch(getAllBoards({ token }));
  }, [token]);

  // Show loading state first
  if (getAllBoardsLoadingStatus === LoadingStatusEnum.pending) {
    return <LoadingSpinner spinnerIconClasses={iconClasses} />;
  }

  // Show empty state
  if (boards.length === 0) {
    return (
      <div className="all-boards-component">
        <BackgroundImage src={bg} alt="Nature Background Image" />
        <p className="text-center text-2xl">No Boards Available!</p>
        {token && <BoardNew token={token} />}
      </div>
    );
  }

  function handleDeleteBoard(board_id: number) {
    if (!token) return;
    dispatch(deleteBoard({ token: token, boardId: board_id }));
  }

  useEffect(() => {
    if (!isConnected) return;

    for (let board of boards) {
      sendMessage({
        action: "unsubscribe",
        channel: `boards:${board.id}`,
      });
    }
  }, [isConnected, sendMessage]);

  // Show boards
  return (
    <div className="all-boards-component container mx-auto text-center">
      <BackgroundImage src={bg} alt="Nature Background Image" />
      <div className="board-new-button-container text-2xl md:hidden bg-gray-200 dark:bg-gray-800">
        {token && <BoardNew token={token} />}
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
