import { socketio } from "./socketio";

export const socketConnect = (accessToken: string) => {
  socketio.auth = {
    token: accessToken,
  };

  socketio.on("connect", () => {
    console.log("Socket connected:", socketio.id);
  });

  socketio.on("connect_error", (err) => {
    console.log("Socket connection error:", err.message);
  });

  socketio.connect();
};

export const socketDisconnect = () => {
  socketio.on("disconnect", () => {
    console.log("user disconnected");
  });

  socketio.disconnect();
};

export const socketOn = (event: string, listener: (data: string) => void) => {
  socketio.on(event, listener);
};
