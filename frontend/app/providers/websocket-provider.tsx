import { createContext, useContext, useState, type ReactNode } from "react";
import { useWebSocket } from "~/hooks";

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
  const { disconnect, isConnected, isConnecting, sendMessage } = useWebSocket(
    import.meta.env.VITE_SOCKET_URL,
  );

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

export function useActiveWebsocket() {
  const context = useContext(WebsocketContext);
  if (!context) {
    throw new Error(
      "useActiveWebsocket must be used inside WebsocketProvider.",
    );
  }
  return context;
}
