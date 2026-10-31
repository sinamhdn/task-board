import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  LoadingStatusEnum,
  type BackendValidationErrorInterface,
  // type BoardMemberRecievedInterface,
  // type BoardMemberRecievedInterface,
  type BoardRecievedInterface,
} from "~/state";
import log from "~/utils/logger";
import { setError } from "./errorSlice";

const logger = log.getLogger("BOARD MEMBER SLICE LOGGER");
logger.setLevel(import.meta.env.DEV ? "debug" : "warn");

const initialState: {
  getAllBoardsLoadingStatus: string | null;
  getBoardByIdLoadingStatus: string | null;
  createNewBoardLoadingStatus: string | null;
  updateBoardLoadingStatus: string | null;
  deleteBoardLoadingStatus: string | null;
  boards: BoardRecievedInterface[];
} = {
  getAllBoardsLoadingStatus: null,
  getBoardByIdLoadingStatus: null,
  createNewBoardLoadingStatus: null,
  updateBoardLoadingStatus: null,
  deleteBoardLoadingStatus: null,
  boards: [],
};

const boardSlice = createSlice({
  name: "board",
  initialState: initialState,
  reducers: {
    resetBoards: (state) => {
      state.boards = [];
      state.getAllBoardsLoadingStatus = null;
      state.getBoardByIdLoadingStatus = null;
      state.createNewBoardLoadingStatus = null;
      state.updateBoardLoadingStatus = null;
      state.deleteBoardLoadingStatus = null;
    },
    addBoardDirect: (state, action) => {
      if (state.boards.find((board) => board.id === action.payload.id)) return;
      state.boards.push(action.payload);
    },
    removeBoardDirect: (state, action) => {
      state.boards = state.boards.filter(
        (board) => board.id !== action.payload.id,
      );
    },
    updateBoardDirect: (state, action) => {
      logger.info(
        `updateBoardDirect what does it recieve --> ${action.payload}`,
        action.payload,
      );
      const boardIndex = state.boards.findIndex(
        (board) => board.id === action.payload.id,
      );
      state.boards[boardIndex] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllBoards.fulfilled, (state, action) => {
        state.getAllBoardsLoadingStatus = LoadingStatusEnum.fulfilled;
        state.boards = action.payload;
      })
      .addCase(getAllBoards.pending, (state) => {
        state.getAllBoardsLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(getAllBoards.rejected, (state, action) => {
        state.getAllBoardsLoadingStatus = LoadingStatusEnum.rejected;
      })
      .addCase(getBoardById.fulfilled, (state, action) => {
        state.getBoardByIdLoadingStatus = LoadingStatusEnum.fulfilled;
        state.boards.push(action.payload);
      })
      .addCase(getBoardById.pending, (state) => {
        state.getBoardByIdLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(getBoardById.rejected, (state, action) => {
        state.getBoardByIdLoadingStatus = LoadingStatusEnum.rejected;
      })
      .addCase(createNewBoard.fulfilled, (state, action) => {
        state.createNewBoardLoadingStatus = LoadingStatusEnum.fulfilled;
        state.boards.push(action.payload);
      })
      .addCase(createNewBoard.pending, (state) => {
        state.createNewBoardLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(createNewBoard.rejected, (state, action) => {
        state.createNewBoardLoadingStatus = LoadingStatusEnum.rejected;
      })
      .addCase(updateBoard.fulfilled, (state, action) => {
        state.updateBoardLoadingStatus = LoadingStatusEnum.fulfilled;
        const boardIndex = state.boards.findIndex(
          (board) => board.id === action.payload.id,
        );
        state.boards[boardIndex] = action.payload;
      })
      .addCase(updateBoard.pending, (state) => {
        state.updateBoardLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(updateBoard.rejected, (state, action) => {
        state.updateBoardLoadingStatus = LoadingStatusEnum.rejected;
      })
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.deleteBoardLoadingStatus = LoadingStatusEnum.fulfilled;
        const boardId = action.meta.arg.boardId; // from the original thunk call
        state.boards = state.boards.filter((board) => board.id !== boardId);
      })
      .addCase(deleteBoard.pending, (state) => {
        state.deleteBoardLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(deleteBoard.rejected, (state, action) => {
        state.deleteBoardLoadingStatus = LoadingStatusEnum.rejected;
      });
  },
});

export const getAllBoards = createAsyncThunk<
  BoardRecievedInterface[],
  { skip?: number; limit?: number; order?: string; token: string },
  { rejectValue: BackendValidationErrorInterface[] }
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
        logger.error("boardSlice.ts::" + error.response?.data.detail);
        dispatch(setError(errorMessage));
        return rejectWithValue(errorMessage);
      }
      dispatch(setError([{ field: "server_error", msg: "Unknown error" }]));
      return rejectWithValue([{ field: "server_error", msg: "Unknown error" }]);
    }
  },
);

export const getBoardById = createAsyncThunk<
  BoardRecievedInterface,
  { boardId: number; token: string },
  { rejectValue: BackendValidationErrorInterface[] }
>(
  "board/boardbyid",
  async ({ token, boardId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/boards/${boardId}`,
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
        logger.error("boardSlice.ts::" + error.response?.data.detail);
        dispatch(setError(errorMessage));
        return rejectWithValue(errorMessage);
      }
      dispatch(setError([{ field: "server_error", msg: "Unknown error" }]));
      return rejectWithValue([{ field: "server_error", msg: "Unknown error" }]);
    }
  },
);

export const createNewBoard = createAsyncThunk<
  BoardRecievedInterface,
  { boardName: string; token: string },
  { rejectValue: BackendValidationErrorInterface[] }
>(
  "board/newboard",
  async ({ token, boardName }, { dispatch, rejectWithValue }) => {
    logger.info("createNewBoard name", boardName);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/boards`,
        {
          board_name: boardName,
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
        logger.error("boardSlice.ts::" + error);
        dispatch(setError(errorMessage));
        return rejectWithValue(errorMessage);
      }
      dispatch(setError([{ field: "server_error", msg: "Unknown error" }]));
      return rejectWithValue([{ field: "server_error", msg: "Unknown error" }]);
    }
  },
);

export const updateBoard = createAsyncThunk<
  BoardRecievedInterface,
  { boardId: number; token: string; boardName: string },
  { rejectValue: BackendValidationErrorInterface[] }
>(
  "board/updateboard",
  async ({ token, boardId, boardName }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/v1/boards/${boardId}`,
        { board_name: boardName },
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
        logger.error("boardSlice.ts::" + error.response?.data.detail);
        dispatch(setError(errorMessage));
        return rejectWithValue(errorMessage);
      }
      dispatch(setError([{ field: "server_error", msg: "Unknown error" }]));
      return rejectWithValue([{ field: "server_error", msg: "Unknown error" }]);
    }
  },
);

export const deleteBoard = createAsyncThunk<
  BoardRecievedInterface,
  { boardId: number; token: string },
  { rejectValue: BackendValidationErrorInterface[] }
>(
  "board/deleteboard",
  async ({ token, boardId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/v1/boards/${boardId}`,
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
        logger.error("boardSlice.ts::" + error);
        dispatch(setError(errorMessage));
        return rejectWithValue(errorMessage);
      }
      dispatch(setError([{ field: "server_error", msg: "Unknown error" }]));
      return rejectWithValue([{ field: "server_error", msg: "Unknown error" }]);
    }
  },
);

export const {
  resetBoards,
  addBoardDirect,
  removeBoardDirect,
  updateBoardDirect,
} = boardSlice.actions;

export default boardSlice.reducer;
