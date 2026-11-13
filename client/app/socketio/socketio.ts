import { io } from "socket.io-client";
import { getSocketUrl } from "~/utils/api";

const URL =
  import.meta.env.VITE_NODE_ENV === "production" ? undefined : getSocketUrl();

export const socketio = io(URL, {
  autoConnect: false,
  transports: ["websocket"],
});
