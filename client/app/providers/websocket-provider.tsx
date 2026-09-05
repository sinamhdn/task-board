import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useWebSocket } from "~/hooks";
import { getToken } from "~/utils";

interface WebsocketContextType {
  disconnect: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  sendMessage: (obj: {
    action: string;
    channel: string;
    message?: string;
  }) => void;
}

const WebsocketContext = createContext<WebsocketContextType | null>(null);

export function WebsocketProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  useEffect(() => {
    const accessToken = getToken();
    setAccessToken(accessToken);
  });
  const { disconnect, isConnected, isConnecting, sendMessage } = useWebSocket({
    wsurl: import.meta.env.VITE_SOCKET_URL,
    token: accessToken,
  });

  return (
    <WebsocketContext.Provider
      value={{
        isConnected,
        isConnecting,
        disconnect,
        sendMessage,
      }}
    >
      {children}
    </WebsocketContext.Provider>
  );
}

export function useWebsocketContext() {
  const context = useContext(WebsocketContext);
  if (!context) {
    throw new Error(
      "useActiveWebsocket must be used inside WebsocketProvider.",
    );
  }
  return context;
}
