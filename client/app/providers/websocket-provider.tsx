import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { redirect } from "react-router";
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
  const [isMounted, setIsMounted] = useState(false);

  // ✅ Only run on client after mount
  useEffect(() => {
    setIsMounted(true);

    const token = getToken();
    if (!token) {
      window.location.href = "/signin";
    }
  }, []);

  // ✅ Don't render anything on server
  if (!isMounted) {
    return null; // Return null, not "Loading..."
  }

  // ✅ Now we're safely on the client
  const token = getToken();
  if (!token) {
    // Already redirecting via useEffect
    return null;
  }

  const wsURLRef = useRef(import.meta.env.VITE_SOCKET_URL + token);
  const { disconnect, isConnected, isConnecting, sendMessage } = useWebSocket({
    wsurl: wsURLRef.current,
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
