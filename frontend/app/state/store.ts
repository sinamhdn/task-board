import { configureStore } from "@reduxjs/toolkit";
import sessionSlice from "./sessionSlice";

export const store = configureStore({
  reducer: { user: sessionSlice },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
      serializableCheck: {
        ignoredActions: ["pesist/PERSIST", "session/setSocket"],
      },
    }),
  // devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
