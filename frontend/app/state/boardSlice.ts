import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { setError } from "./errorSlice";

export interface RecievedBoardsInterface {
  id: number;
  uid: string;
  name: string;
  updated_at: string;
  created_at: string;
}

export const LoadingStatus = {
  fulfilled: "fulfilled",
  pending: "pending",
  rejected: "rejected",
};

export interface BackendValidationError {
  field: string;
  msg: string;
}

const initialState: {
  getBoardsLoadingStatus: string | null;
  createBoardLoadingStatus: string | null;
  boards: RecievedBoardsInterface[];
} = {
  getBoardsLoadingStatus: null,
  createBoardLoadingStatus: null,
  boards: [],
};

const boardSlice = createSlice({
  name: "board",
  initialState: initialState,
  reducers: {
    resetBoards: (state) => {
      state.boards = [];
      state.getBoardsLoadingStatus = null;
      state.createBoardLoadingStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllBoards.fulfilled, (state, action) => {
        state.getBoardsLoadingStatus = LoadingStatus.fulfilled;
        state.boards = action.payload;
        console.log(
          "sessionSlice.ts:: WHAT DOES SUCCESSUFUL STATE RETURNS IN LOGIN?",
          action.payload,
        );
      })
      .addCase(getAllBoards.pending, (state) => {
        state.getBoardsLoadingStatus = LoadingStatus.pending;
      })
      .addCase(getAllBoards.rejected, (state, action) => {
        state.getBoardsLoadingStatus = LoadingStatus.rejected;
      })
      .addCase(createNewBoard.fulfilled, (state, action) => {
        state.createBoardLoadingStatus = LoadingStatus.fulfilled;
        state.boards.push(action.payload);
        console.log(
          "sessionSlice.ts:: WHAT DOES SUCCESSUFUL STATE RETURNS IN LOGIN?",
          action.payload,
        );
      })
      .addCase(createNewBoard.pending, (state) => {
        state.createBoardLoadingStatus = LoadingStatus.pending;
      })
      .addCase(createNewBoard.rejected, (state, action) => {
        state.createBoardLoadingStatus = LoadingStatus.rejected;
      });
  },
});

export const getAllBoards = createAsyncThunk<
  RecievedBoardsInterface[],
  { skip?: number; limit?: number; order?: string; token: string },
  { rejectValue: BackendValidationError[] }
>(
  "board/getall",
  async ({ token, skip, limit, order }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/boards`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            skip,
            limit,
            order,
          },
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data.detail || [];
        console.log("boardSlice.ts::" + error.response?.data.detail);
        dispatch(setError(errorMessage));
        return rejectWithValue(errorMessage);
      }
      dispatch(setError([{ field: "server_error", msg: "Unknown error" }]));
      return rejectWithValue([{ field: "server_error", msg: "Unknown error" }]);
    }
  },
);

export const createNewBoard = createAsyncThunk<
  RecievedBoardsInterface,
  { board_name: string; token: string },
  { rejectValue: BackendValidationError[] }
>(
  "board/newboard",
  async ({ token, board_name }, { dispatch, rejectWithValue }) => {
    console.log("createNewBoard name", board_name);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/boards`,
        {
          name: board_name,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data.detail || [];
        console.log("boardSlice.ts::" + error);
        dispatch(setError(errorMessage));
        return rejectWithValue(errorMessage);
      }
      dispatch(setError([{ field: "server_error", msg: "Unknown error" }]));
      return rejectWithValue([{ field: "server_error", msg: "Unknown error" }]);
    }
  },
);

export default boardSlice.reducer;
