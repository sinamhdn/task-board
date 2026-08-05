import { useCallback, useEffect, useRef, useState } from "react";

interface WebSocketHookInput {
  wsurl: string;
  retryAtempts?: number;
  retryInterval?: number;
}

interface WebSocketDataRecieved {
  message: string;
  timestamp: number;
}

type SendFunction = (data: object) => void;

export function useWebSocket({
  wsurl,
  retryAtempts: defaultRetryAttempts = 3,
  retryInterval = 1500,
}: WebSocketHookInput) {
  const [dataRecieved, setDataRecieved] =
    useState<WebSocketDataRecieved | null>(null);
  const [socketState, setSocketState] = useState<
    "open" | "close" | "connecting"
  >("close");
  const sendCallback = useRef<SendFunction>(() => false);
  const retryCountRef = useRef(defaultRetryAttempts);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(true);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    shouldReconnectRef.current = true;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    try {
      const ws = new WebSocket(wsurl);
      wsRef.current = ws;
      setSocketState("connecting");

      ws.onopen = () => {
        console.log("CONNECTED TO SOCKET");
        setSocketState("open");
        // Reset retry count on successful connection
        retryCountRef.current = defaultRetryAttempts;
        sendCallback.current = (data) => {
          try {
            const d = convertObjecttoJSON(data);
            ws.send(d);
            return true;
          } catch (err) {
            console.error("Failed to send websocket message:", err);
            return false;
          }
        };
      };

      ws.onmessage = (event) => {
        try {
          const msg = convertJSONtoObject(event.data);
          setDataRecieved({
            message: typeof msg === "string" ? msg : JSON.stringify(msg),
            timestamp: getTimeStamp(),
          });
        } catch (err) {
          console.error("Failed to process message:", err);
        }
      };

      ws.onclose = () => {
        console.log("WEBSOCKET CLOSED");
        setSocketState("close");
        sendCallback.current = () => false;
        // Attempt reconnect if retries remaining
        if (!shouldReconnectRef.current) return;
        // retrydecrement(connect);
        retryincrement(connect);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        // The onclose handler will trigger after this
      };
    } catch (err) {
      console.error("Failed to create WebSocket connection:", err);
      setSocketState("close");
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
    setSocketState("close");
    sendCallback.current = () => false;
  }, []);

  useEffect(() => {
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
        console.log(
          `Reconnecting... ${retryCountRef.current} attempts remaining`,
        );
        reconnectTimeoutRef.current = window.setTimeout(() => {
          retryCountRef.current = retryCountRef.current - 1;
          reconnect();
        }, retryInterval);
      } else {
        console.log("No more retry attempts remaining");
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
    reconnectTimeoutRef.current = window.setTimeout(() => {
      reconnect();
    }, delay);
  }, []);

  return {
    dataRecieved,
    socketState,
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
    console.error(
      "Failed to converts a JavaScript Object Notation (JSON) string into an object:",
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
    console.error(
      "Failed to converts an object string into a JavaScript Object Notation (JSON):",
      err,
    );
    return "{}";
  }
}

function getTimeStamp() {
  return Date.now();
}
