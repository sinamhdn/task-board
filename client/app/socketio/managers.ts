import log from "~/utils/logger";
import { socketio } from "./socketio";

const logger = log.getLogger("socketio logger");
logger.setLevel(import.meta.env.DEV ? "debug" : "warn");

export const socketConnect = (accessToken: string) => {
  socketio.auth = {
    token: accessToken,
  };

  socketio.on("connect", () => {
    logger.info("socketio: socket connected:", socketio.id);
  });

  socketio.on("connect_error", (err) => {
    logger.info("socketio: socket connection error:", err.message);
  });

  socketio.connect();
};

export const socketDisconnect = () => {
  socketio.on("disconnect", () => {
    logger.info("socketio: user disconnected");
  });

  socketio.disconnect();
};

export const socketOn = (event: string, listener: (data: string) => void) => {
  socketio.on(event, listener);
};
