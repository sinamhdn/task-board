import { socket } from "./socket";

export const socketConnect = (accessToken: string) => {
  socket.auth = {
    token: accessToken,
  };

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.log("Socket connection error:", err.message);
  });

  socket.connect();
};

export const socketDisconnect = () => {
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.disconnect();
};

export const socketOn = (event: string, listener: (data: string) => void) => {
  socket.on(event, listener);
};
