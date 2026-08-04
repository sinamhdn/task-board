import { io } from "socket.io-client";

const URL =
  import.meta.env.VITE_NODE_ENV === "production"
    ? undefined
    : import.meta.env.VITE_SOCKET_URL;

export const socketio = io(URL, {
  autoConnect: false,
  transports: ["websocket"],
});
