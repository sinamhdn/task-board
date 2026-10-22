import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  SocketConnectionStatusType,
  SocketErrorInterface,
  SocketFrameInterface,
  SocketStateInterface,
} from "~/state";

// ---- Slice ----

const initialState: SocketStateInterface = {
  data: null,
  error: null,
  status: null,
};

const socketSlice = createSlice({
  name: "socket", // ✅ matches slice
  initialState,
  reducers: {
    // Replace the frame (typical for WS frames)
    setData: (state, action: PayloadAction<SocketFrameInterface>) => {
      state.data = action.payload;
    },
    // Or, if you need to merge partials:
    // patchData: (state, action: PayloadAction<Partial<SocketFrame>>) => {
    //   state.data = state.data ? { ...state.data, ...action.payload } : (action.payload as SocketFrame);
    // },

    clearData: (state) => {
      state.data = null;
    },

    setError: (state, action: PayloadAction<SocketErrorInterface>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    setStatus: (state, action: PayloadAction<SocketConnectionStatusType>) => {
      state.status = action.payload;
    },

    clearStatus: (state) => {
      state.status = null;
    },
  },
});

export const {
  setData,
  clearData,
  setError,
  clearError,
  setStatus,
  clearStatus,
} = socketSlice.actions;

export default socketSlice.reducer;
