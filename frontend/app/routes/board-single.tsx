import type { Route } from "./+types/boardsingle";
import BoardMembers from "~/components/board-members";
import { useEffect } from "react";
import { useLocation, useParams } from "react-router";
import LoadingSpinner from "~/components/loading-spinner";
import BoardAddNewList from "~/components/board-add-new-list";
import { useActiveWebsocket } from "~/providers/websocket-provider";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Single Boards" },
    { name: "description", content: "Single Boards!" },
  ];
}

function BoardSingle() {
  const { id } = useParams();
  const location = useLocation();
  const { board } = location.state;
  const { isConnected, sendMessage, disconnect } = useActiveWebsocket();

  useEffect(() => {
    if (isConnected)
      sendMessage({ action: "subscribe", channel: `boards:${id}` });
    return disconnect();
  }, []);

  return (
    <div className="single-board-component">
      {!board ? (
        <LoadingSpinner />
      ) : (
        <div>
          <header>
            <h3>{board.name}</h3>
            <BoardMembers />
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
