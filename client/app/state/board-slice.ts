import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import {
  LoadingStatusEnum,
  type BackendValidationErrorInterface,
  // type BoardMemberRecievedInterface,
  // type BoardMemberRecievedInterface,
  type BoardRecievedInterface,
} from "~/state";
import { axios_base } from "~/utils/api";
import log from "~/utils/logger";
import { setError } from "./error-slice";

const logger = log.getLogger("board-slice logger");
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
    resetBoards: () => initialState,
    addBoardDirect: (state, action: PayloadAction<BoardRecievedInterface>) => {
      if (state.boards.some((board) => board.id === action.payload.id)) return;
      state.boards.push(action.payload);
    },
    removeBoardDirect: (state, action: PayloadAction<{ id: number }>) => {
      const index = state.boards.findIndex((b) => b.id === action.payload.id);
      if (index === -1) return;
      state.boards.splice(index, 1);
    },
    updateBoardDirect: (
      state,
      action: PayloadAction<BoardRecievedInterface>,
    ) => {
      const index = state.boards.findIndex((b) => b.id === action.payload.id);
      if (index === -1) return;
      state.boards[index] = action.payload;
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
      .addCase(getAllBoards.rejected, (state) => {
        state.getAllBoardsLoadingStatus = LoadingStatusEnum.rejected;
      })
      .addCase(getBoardById.fulfilled, (state, action) => {
        state.getBoardByIdLoadingStatus = LoadingStatusEnum.fulfilled;
        if (state.boards.some((board) => board.id === action.payload.id))
          return;
        state.boards.push(action.payload);
      })
      .addCase(getBoardById.pending, (state) => {
        state.getBoardByIdLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(getBoardById.rejected, (state) => {
        state.getBoardByIdLoadingStatus = LoadingStatusEnum.rejected;
      })
      .addCase(createNewBoard.fulfilled, (state, action) => {
        state.createNewBoardLoadingStatus = LoadingStatusEnum.fulfilled;
        if (state.boards.some((board) => board.id === action.payload.id))
          return;
        state.boards.push(action.payload);
      })
      .addCase(createNewBoard.pending, (state) => {
        state.createNewBoardLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(createNewBoard.rejected, (state) => {
        state.createNewBoardLoadingStatus = LoadingStatusEnum.rejected;
      })
      .addCase(updateBoard.fulfilled, (state, action) => {
        state.updateBoardLoadingStatus = LoadingStatusEnum.fulfilled;
        const index = state.boards.findIndex((b) => b.id === action.payload.id);
        if (index === -1) return;
        state.boards[index] = action.payload;
      })
      .addCase(updateBoard.pending, (state) => {
        state.updateBoardLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(updateBoard.rejected, (state) => {
        state.updateBoardLoadingStatus = LoadingStatusEnum.rejected;
      })
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.deleteBoardLoadingStatus = LoadingStatusEnum.fulfilled;
        const index = state.boards.findIndex((b) => b.id === action.payload.id);
        if (index === -1) return;
        state.boards.splice(index, 1);
      })
      .addCase(deleteBoard.pending, (state) => {
        state.deleteBoardLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(deleteBoard.rejected, (state) => {
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
      const response = await axios_base.get(`/api/v1/boards`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          skip,
          limit,
          order,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data.detail || [];
        logger.error(
          "board-slice: getAllBoards -> error.response?.data.detail = ",
          error.response?.data.detail,
        );
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
      const response = await axios_base.get(`/api/v1/boards/${boardId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data.detail || [];
        logger.error(
          "board-slice: getBoardById -> error.response?.data.detail = ",
          error.response?.data.detail,
        );
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
    logger.info("board-slice: createNewBoard -> boardName = ", boardName);
    try {
      const response = await axios_base.post(
        `/api/v1/boards`,
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
        logger.error("board-slice: createNewBoard -> error = ", error);
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
      const response = await axios_base.patch(
        `/api/v1/boards/${boardId}`,
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
        logger.error(
          "board-slice: updateBoard -> error.response?.data.detail = ",
          error.response?.data.detail,
        );
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
      const response = await axios_base.delete(`/api/v1/boards/${boardId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data.detail || [];
        logger.error("board-slice: deleteBoard -> error = ", error);
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
