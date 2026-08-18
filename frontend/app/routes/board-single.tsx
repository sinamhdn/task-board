import { useWebSocket } from "~/hooks";
import type { Route } from "./+types/boardsingle";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Single Boards" },
    { name: "description", content: "Single Boards!" },
  ];
}

function BoardSingle() {
  const { sendMessage, disconnect, isConnected, isConnecting } = useWebSocket(
    import.meta.env.VITE_SOCKET_URL,
  );

  return <div className="single-board-component"></div>;
}

export default BoardSingle;
