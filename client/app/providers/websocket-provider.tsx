import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useWebSocket } from "~/hooks";
import { getToken } from "~/utils";
import type { Route } from "../+types/root";
import { useLoaderData } from "react-router";
import { useAppSelector } from "~/state/hooks";

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

// for some reason when app starts it loads the old webtoken inside memory
// starting state with null may fix this
// export async function clientLoader({ request }: Route.ClientLoaderArgs) {
//   const token = getToken();
//   console.log(`WebsocketProvider CLIENT LOADER ACCESS TOKEN ${token}`);
//   return token;
// }

// clientLoader.hydrate = true as const;

const WebsocketContext = createContext<WebsocketContextType | null>(null);

export function WebsocketProvider({ children }: { children: ReactNode }) {
  // const clientLoaderToken = useLoaderData<typeof clientLoader>();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [shouldWebsocketConnect, setShouldWebsocketConnect] = useState(false);
  const currentUser = useAppSelector((state) => state.session.currentUser);

  useEffect(() => {
    const newToken = getToken();
    if (newToken) {
      setAccessToken(newToken);
      setShouldWebsocketConnect(true);
    }
    console.log(
      `WebsocketProvider ACCESS TOKEN VALUE INSIDE USEEFFECT ${newToken}`,
    );
  }, [currentUser]);

  console.log(`WebsocketProvider ACCESS TOKEN VALUE ${accessToken}`);

  const { disconnect, isConnected, isConnecting, sendMessage } = useWebSocket({
    wsurl: import.meta.env.VITE_SOCKET_URL + accessToken,
    shouldConnect: shouldWebsocketConnect,
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
