import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  RecievedBoardMemberInterface,
  RecievedBoardsInterface,
} from "./boardSlice";

// ---- WebSocket frame (outer) ----

export interface SocketFrame {
  /** JSON-encoded string of `BoardChannelPayload` */
  message: string;
  timestamp: number;
}

export interface SocketError {
  type: string;
  msg: string;
}

export const socketStatus = {
  open: "open",
  connecting: "connecting",
  close: "close",
} as const;

export type SocketStatus = (typeof socketStatus)[keyof typeof socketStatus];

export interface SocketState {
  data: SocketFrame | null;
  error: SocketError | null;
  status: SocketStatus | null;
}

export interface BackendValidationError {
  field: string;
  msg: string;
}

// ---- Broadcast payload (inner) ----

export type BroadcastResType = "broadcast_channel";

export interface EventMemberAddedInterface {
  event: "member_added"; // ✅ literal
  member_data: RecievedBoardMemberInterface;
  board_data: RecievedBoardsInterface;
}

export interface EventMemberRemovedInterface {
  event: "member_removed"; // ✅ literal
  member_data: RecievedBoardMemberInterface;
  board_data: RecievedBoardsInterface;
}

export interface EventBoardRemovedInterface {
  event: "board_removed"; // ✅ literal
  member_data: RecievedBoardMemberInterface;
  board_data: RecievedBoardsInterface;
}

// Add more variants as your backend adds them, e.g.
// export interface EventMemberRemovedInterface { event: "member_removed"; ... }
// export interface EventBoardUpdatedInterface  { event: "board_updated"; ... }

export type BoardChannelMessage =
  | EventMemberAddedInterface
  | EventMemberRemovedInterface
  | EventBoardRemovedInterface;

export interface BoardChannelPayload {
  res_type: BroadcastResType;
  channel: string;
  message: BoardChannelMessage;
}

// ---- Slice ----

const initialState: SocketState = {
  data: null,
  error: null,
  status: null,
};

const socketSlice = createSlice({
  name: "socket", // ✅ matches slice
  initialState,
  reducers: {
    // Replace the frame (typical for WS frames)
    setData: (state, action: PayloadAction<SocketFrame>) => {
      state.data = action.payload;
    },
    // Or, if you need to merge partials:
    // patchData: (state, action: PayloadAction<Partial<SocketFrame>>) => {
    //   state.data = state.data ? { ...state.data, ...action.payload } : (action.payload as SocketFrame);
    // },

    clearData: (state) => {
      state.data = null;
    },

    setError: (state, action: PayloadAction<SocketError>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    setStatus: (state, action: PayloadAction<SocketStatus>) => {
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
