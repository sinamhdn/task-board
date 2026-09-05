import { createSlice } from "@reduxjs/toolkit";
import type {
  RecievedBoardMemberInterface,
  RecievedBoardsInterface,
} from "./boardSlice";

export interface SocketError {
  type: string;
  msg: string;
}

export interface EventMemberAddedInterface {
  event: string;
  member_data: RecievedBoardMemberInterface;
  board_data: RecievedBoardsInterface;
}

export interface SocketState {
  data: EventMemberAddedInterface | null;
  error: SocketError | null;
  status: string | null;
}

export interface BackendValidationError {
  field: string;
  msg: string;
}

export const socketStatus = {
  open: "open",
  connecting: "connecting",
  close: "close",
};

const initialState: SocketState = {
  data: null,
  error: null,
  status: null,
};

const socketSlice = createSlice({
  name: "session",
  initialState: initialState,
  reducers: {
    setData: (state, action) => {
      state.data = {
        ...state.data,
        ...action.payload,
      };
    },
    clearData: (state) => {
      state.data = null;
    },
    setError: (state, action) => {
      state.error = {
        ...state.error,
        ...action.payload,
      };
    },
    clearError: (state) => {
      state.error = null;
    },
    setStatus: (state, action) => {
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
