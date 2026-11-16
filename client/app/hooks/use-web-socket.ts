import { useCallback, useEffect, useRef } from "react";
import { useAppDispatch } from "~/state/hooks";
import { setData, setStatus as setSocketStatus } from "~/state/socket-slice";
import log from "~/utils/logger";
import { useAppSelector } from "../state/hooks";

interface WebSocketHookInput {
  wsurl: string | null;
  shouldConnect: boolean;
  retryAtempts?: number;
  retryInterval?: number;
}

type SendFunction = (data: object) => void;

const logger = log.getLogger("use-web-socket logger");
logger.setLevel(import.meta.env.DEV ? "debug" : "warn");

export function useWebSocket({
  wsurl,
  shouldConnect,
  retryAtempts: defaultRetryAttempts = 3,
  retryInterval = 1500,
}: WebSocketHookInput) {
  // const [dataRecieved, setDataRecieved] =
  //   useState<WebSocketDataRecieved | null>(null);
  // const [socketState, setSocketState] = useState<
  //   "open" | "close" | "connecting"
  // >("close");
  const sendCallback = useRef<SendFunction>(() => false);
  const retryCountRef = useRef(defaultRetryAttempts);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);

  const dispatch = useAppDispatch();
  const socketState = useAppSelector((state) => state.socketSlice.status);

  const connect = useCallback(() => {
    // ✅ Guard: reject empty or malformed URLs
    if (!shouldConnect || !wsurl) {
      logger.warn("use-web-socket: websocket url not available");
      dispatch(setSocketStatus("close"));
      return;
    }

    if (!wsurl.startsWith("ws://") && !wsurl.startsWith("wss://")) {
      logger.warn(
        "use-web-socket: invalid WebSocket URL, skipping connection ---> ",
        wsurl,
      );
      dispatch(setSocketStatus("close"));
      return;
    }

    shouldReconnectRef.current = true;

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    if (!shouldConnect) return;

    try {
      const ws = new WebSocket(wsurl);
      wsRef.current = ws;
      // setSocketState("connecting");
      dispatch(setSocketStatus("connecting"));

      if (!ws) return;

      ws.onopen = () => {
        logger.warn(
          "use-web-socket: connected to websocket (onopen) - websocket connection opened",
        );
        // setSocketState("open");
        dispatch(setSocketStatus("open"));
        // Reset retry count on successful connection
        retryCountRef.current = defaultRetryAttempts;
        sendCallback.current = (data) => {
          try {
            const d = convertObjecttoJSON(data);
            ws.send(d);
            return true;
          } catch (err) {
            logger.error(
              "use-web-socket: failed to send websocket message ---> ",
              err,
            );
            return false;
          }
        };
      };

      ws.onmessage = (event) => {
        logger.info(
          "use-web-socket: websocket message recieved (onmessage) ---> event = ",
          event,
        );
        logger.info(
          "use-web-socket: websocket message recieved (onmessage) ---> event.data = ",
          event.data,
        );
        try {
          const msg = convertJSONtoObject(event.data);
          // setDataRecieved({
          //   message: typeof msg === "string" ? msg : JSON.stringify(msg),
          //   timestamp: getTimeStamp(),
          // });
          dispatch(
            setData({
              message: typeof msg === "string" ? msg : JSON.stringify(msg),
              timestamp: getTimeStamp(),
            }),
          );
        } catch (err) {
          logger.error("use-web-socket: failed to process message ---> ", err);
        }
      };

      ws.onclose = () => {
        logger.info(
          "use-web-socket: websocket disconnected (onclose) - websocket connection closed",
        );
        // setSocketState("close");
        dispatch(setSocketStatus("close"));
        sendCallback.current = () => false;
        // Attempt reconnect if retries remaining
        if (!shouldReconnectRef.current) return;
        // retrydecrement(connect);
        retryincrement(connect);
      };

      ws.onerror = (error) => {
        logger.error("use-web-socket: websocket error (onerror) ---> ", error);
        // The onclose handler will trigger after this
      };
    } catch (err) {
      logger.error(
        "use-web-socket: failed to create websocket connection ---> ",
        err,
      );
      // setSocketState("close");
      dispatch(setSocketStatus("close"));
    }
  }, [wsurl, defaultRetryAttempts, retryInterval]);

  //cleanup
  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    // setSocketState("close");
    dispatch(setSocketStatus("close"));
    sendCallback.current = () => false;
  }, [dispatch]);

  useEffect(() => {
    if (!wsurl) return;

    connect();
    // Cleanup on unmount or when wsurl changes
    // useEffect calls function on component unmount
    return () => disconnect();
  }, [connect, disconnect, wsurl]);

  const sendMessage = useCallback((data: object) => {
    return sendCallback.current(data);
  }, []);

  const retrydecrement = useCallback(
    (reconnect: () => void) => {
      if (retryCountRef.current > 0) {
        logger.warn(
          "use-web-socket: websocket reconnecting... ",
          retryCountRef.current,
          " attempts remaining",
        );
        reconnectTimeoutRef.current = window.setTimeout(() => {
          retryCountRef.current = retryCountRef.current - 1;
          reconnect();
        }, retryInterval);
      } else {
        logger.warn(
          "use-web-socket: websocket no more retry attempts remaining",
        );
      }
    },
    [retryInterval],
  );

  const retryincrement = useCallback((reconnect: () => void) => {
    if (!shouldReconnectRef.current) {
      return;
    }
    const attempts = reconnectAttemptsRef.current;
    const delay = Math.min(1000 * 2 ** attempts, 10000);
    reconnectAttemptsRef.current += 1;
    logger.warn(
      "use-web-socket: websocket reconnecting... attempt = ",
      retryCountRef.current,
    );
    reconnectTimeoutRef.current = window.setTimeout(() => {
      reconnect();
    }, delay);
  }, []);

  return {
    // dataRecieved,
    // socketState,
    sendMessage,
    disconnect,
    isConnected: socketState === "open",
    isConnecting: socketState === "connecting",
  };
}

function convertJSONtoObject(msg: string): unknown {
  try {
    const parsed = JSON.parse(msg);
    return parsed;
  } catch (err) {
    logger.error(
      "use-web-socket: failed to converts a JavaScript Object Notation (JSON) string into an object ---> ",
      err,
    );
    return msg;
  }
}

function convertObjecttoJSON(msg: object): string {
  try {
    const parsed = JSON.stringify(msg);
    return parsed;
  } catch (err) {
    logger.error(
      "use-web-socket: failed to converts an object string into a JavaScript Object Notation (JSON) ---> ",
      err,
    );
    return "{}";
  }
}

function getTimeStamp() {
  return Date.now();
}
