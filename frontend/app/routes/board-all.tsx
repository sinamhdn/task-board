import { useAppDispatch, useAppSelector } from "~/state/hooks";
import type { Route } from "./+types/board-all";
import { useEffect } from "react";
import { getAllBoards, LoadingStatus } from "~/state/boardSlice";
import { getToken } from "~/utils";
import classNames from "classnames";
import BoardCard from "~/components/board-card";

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
  const loadingStatus = useAppSelector((state) => state.board.LoadingStatus);

  const iconClasses = classNames({
    fa: true,
    "fa-user": loadingStatus !== LoadingStatus.pending,
    "fa-spinner": loadingStatus === LoadingStatus.pending,
    "fa-spin": loadingStatus === LoadingStatus.pending,
  });

  useEffect(() => {
    if (!token) return;
    dispatch(getAllBoards({ token }));
  }, []);
  return (
    <div className="all-boards-component">
      {boards && loadingStatus !== LoadingStatus.pending ? (
        <div className="board-card-list">
          {boards.map((board) => {
            return <BoardCard board={board} />;
          })}
        </div>
      ) : (
        <div>Loading....</div>
      )}
      {boards.length === 0 && <p>No Boards Avalable!</p>}
    </div>
  );
}

export default BoardAll;
