import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { setError } from "./errorSlice";

export interface RecievedBoardsInterface {
  id: number;
  uid: string;
  user_id: number;
  name: string;
  updated_at: string;
  created_at: string;
  members:
    | [
        {
          id: number;
          uid: string;
          full_name: string;
          image_file: string | null;
          image_path: string;
        },
      ]
    | [];
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
  deleteBoardLoadingStatus: string | null;
  boards: RecievedBoardsInterface[];
} = {
  getBoardsLoadingStatus: null,
  createBoardLoadingStatus: null,
  deleteBoardLoadingStatus: null,
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
      state.deleteBoardLoadingStatus = null;
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
      })
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.deleteBoardLoadingStatus = LoadingStatus.fulfilled;
        const boardId = action.meta.arg.board_id; // from the original thunk call
        state.boards = state.boards.filter((board) => board.id !== boardId);
      })
      .addCase(deleteBoard.pending, (state) => {
        state.deleteBoardLoadingStatus = LoadingStatus.pending;
      })
      .addCase(deleteBoard.rejected, (state, action) => {
        state.deleteBoardLoadingStatus = LoadingStatus.rejected;
      });
  },
});

export const getAllBoards = createAsyncThunk<
  RecievedBoardsInterface[],
  { skip?: number; limit?: number; order?: string; token: string },
  { rejectValue: BackendValidationError[] }
>(
  "board/allboards",
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
          board_name: board_name,
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

export const deleteBoard = createAsyncThunk<
  RecievedBoardsInterface,
  { board_id: number; token: string },
  { rejectValue: BackendValidationError[] }
>(
  "board/deleteboard",
  async ({ token, board_id }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/v1/boards/${board_id}`,
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
