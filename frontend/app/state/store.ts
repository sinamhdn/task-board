import { configureStore } from "@reduxjs/toolkit";
import sessionSlice from "./sessionSlice";
import socketSlice from "./socketSlice";

export const store = configureStore({
  reducer: { session: sessionSlice, socket: socketSlice },
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
