import { configureStore } from "@reduxjs/toolkit";
import boardMemberSlice from "./board-ember-slice";
import boardSlice from "./board-slice";
import cardSlice from "./card-slice";
import errorSlice from "./error-slice";
import listSlice from "./list-slice";
import searchSlice from "./search-slice";
import sessionSlice from "./session-slice";
import socketSlice from "./socket-slice";

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
