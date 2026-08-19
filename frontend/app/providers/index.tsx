import type { ReactNode } from "react";
import { BoardAddProvider } from "./board-add-provider";
import { ThemeProvider } from "./theme-provider";
import { Provider } from "react-redux";
import { store } from "~/state/store";

function CombinedProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BoardAddProvider>{children}</BoardAddProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default CombinedProviders;
