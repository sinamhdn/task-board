import type { ReactNode } from "react";
import { BoardAddProvider } from "./board-add-provider";
import { ThemeProvider } from "./theme-provider";
import { Provider } from "react-redux";
import { store } from "~/state/store";
import { WebsocketProvider } from "./websocket-provider";

function CombinedProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <WebsocketProvider>
        <ThemeProvider>
          <BoardAddProvider>{children}</BoardAddProvider>
        </ThemeProvider>
      </WebsocketProvider>
    </Provider>
  );
}

export default CombinedProviders;
