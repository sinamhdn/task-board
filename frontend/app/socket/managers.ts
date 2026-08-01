import { socket } from "./socket";

export const socketConnect = (accessToken: string) => {
  socket.auth = {
    token: accessToken,
  };
  socket.connect();
};

export const socketDisconnect = () => {
  socket.disconnect();
};

export const socketOn = (event: string, listener: (data: string) => void) => {
  socket.on(event, listener);
};
