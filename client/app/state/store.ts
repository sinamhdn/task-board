import { configureStore } from "@reduxjs/toolkit";
import boardMemberSlice from "./boardMemberSlice";
import boardSlice from "./boardSlice";
import cardSlice from "./cardSlice";
import errorSlice from "./errorSlice";
import listSlice from "./listSlice";
import searchSlice from "./searchSlice";
import sessionSlice from "./sessionSlice";
import socketSlice from "./socketSlice";

export const store = configureStore({
  reducer: {
    sessionSlice: sessionSlice,
    socketSlice: socketSlice,
    searchSlice: searchSlice,
    boardSlice: boardSlice,
    boardMemberSlice: boardMemberSlice,
    listSlice: listSlice,
    cardSlice: cardSlice,
    errorSlice: errorSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "session/setSocket"],
      },
    }),
  // devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
