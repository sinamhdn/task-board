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
  members: RecievedBoardMemberInterface[];
}

export interface RecievedBoardMemberInterface {
  id: number;
  uid: string;
  email: string;
  full_name: string;
  image_file: string | null;
  image_path: string;
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
  updateBoardsLoadingStatus: string | null;
  addBoardMemberLoadingStatus: string | null;
  deleteBoardMemberLoadingStatus: string | null;
  boards: RecievedBoardsInterface[];
} = {
  getBoardsLoadingStatus: null,
  createBoardLoadingStatus: null,
  deleteBoardLoadingStatus: null,
  updateBoardsLoadingStatus: null,
  addBoardMemberLoadingStatus: null,
  deleteBoardMemberLoadingStatus: null,
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
      state.updateBoardsLoadingStatus = null;
      state.addBoardMemberLoadingStatus = null;
      state.deleteBoardMemberLoadingStatus = null;
    },
    addBoardDirect: (state, action) => {
      if (state.boards.find((board) => board.id === action.payload.id)) return;
      state.boards.push(action.payload);
    },
    removeBoardDirect: (state, action) => {
      state.boards = state.boards.filter(
        (boards) => boards.id !== action.payload.id,
      );
    },
    updateBoardDirect: (state, action) => {
      const boardIndex = state.boards.findIndex(
        (board) => board.id === action.payload.id,
      );
      state.boards[boardIndex] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllBoards.fulfilled, (state, action) => {
        state.getBoardsLoadingStatus = LoadingStatus.fulfilled;
        state.boards = action.payload;
      })
      .addCase(getAllBoards.pending, (state) => {
        state.getBoardsLoadingStatus = LoadingStatus.pending;
      })
      .addCase(getAllBoards.rejected, (state, action) => {
        state.getBoardsLoadingStatus = LoadingStatus.rejected;
      })
      .addCase(getBoardById.fulfilled, (state, action) => {
        state.getBoardsLoadingStatus = LoadingStatus.fulfilled;
        state.boards.push(action.payload);
      })
      .addCase(getBoardById.pending, (state) => {
        state.getBoardsLoadingStatus = LoadingStatus.pending;
      })
      .addCase(getBoardById.rejected, (state, action) => {
        state.getBoardsLoadingStatus = LoadingStatus.rejected;
      })
      .addCase(updateBoard.fulfilled, (state, action) => {
        state.updateBoardsLoadingStatus = LoadingStatus.fulfilled;
        const boardIndex = state.boards.findIndex(
          (board) => board.id === action.payload.id,
        );
        state.boards[boardIndex] = action.payload;
      })
      .addCase(updateBoard.pending, (state) => {
        state.updateBoardsLoadingStatus = LoadingStatus.pending;
      })
      .addCase(updateBoard.rejected, (state, action) => {
        state.updateBoardsLoadingStatus = LoadingStatus.rejected;
      })
      .addCase(createNewBoard.fulfilled, (state, action) => {
        state.createBoardLoadingStatus = LoadingStatus.fulfilled;
        state.boards.push(action.payload);
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
      })
      .addCase(addBoardMember.fulfilled, (state, action) => {
        state.addBoardMemberLoadingStatus = LoadingStatus.fulfilled;
        const newMember = action.payload; // Assuming this is the added member
        const boardId = action.meta.arg.board_id;
        console.log("📝 Adding member:", newMember);
        console.log("📝 To board ID:", boardId);
        const board = state.boards.find((board) => board.id === boardId);
        if (board) {
          const memberExists = board.members.some(
            (member) => member.id === newMember.id,
          );
          if (!memberExists) {
            board.members.push(newMember);
            console.log("✅ Member added successfully");
          } else {
            console.warn("Board not found in state:", boardId);
          }
        }
      })
      .addCase(addBoardMember.pending, (state) => {
        state.addBoardMemberLoadingStatus = LoadingStatus.pending;
      })
      .addCase(addBoardMember.rejected, (state, action) => {
        state.addBoardMemberLoadingStatus = LoadingStatus.rejected;
      })
      .addCase(deleteBoardMember.fulfilled, (state, action) => {
        state.deleteBoardMemberLoadingStatus = LoadingStatus.fulfilled;
        const deletedMemberId = action.payload.id;
        const boardId = action.meta.arg.board_id;
        const board = state.boards.find((board) => board.id === boardId);
        if (board) {
          board.members = board.members.filter(
            (member) => member.id !== deletedMemberId,
          );
        }
      })
      .addCase(deleteBoardMember.pending, (state) => {
        state.deleteBoardMemberLoadingStatus = LoadingStatus.pending;
      })
      .addCase(deleteBoardMember.rejected, (state, action) => {
        state.deleteBoardMemberLoadingStatus = LoadingStatus.rejected;
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

export const getBoardById = createAsyncThunk<
  RecievedBoardsInterface,
  { boardId: number; token: string },
  { rejectValue: BackendValidationError[] }
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
        console.log("boardSlice.ts::" + error.response?.data.detail);
        dispatch(setError(errorMessage));
        return rejectWithValue(errorMessage);
      }
      dispatch(setError([{ field: "server_error", msg: "Unknown error" }]));
      return rejectWithValue([{ field: "server_error", msg: "Unknown error" }]);
    }
  },
);

export const updateBoard = createAsyncThunk<
  RecievedBoardsInterface,
  { board_id: number; token: string; board_name: string },
  { rejectValue: BackendValidationError[] }
>(
  "board/updateboard",
  async ({ token, board_id, board_name }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/v1/boards/${boardId}`,
        { board_name: board_name },
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

export const addBoardMember = createAsyncThunk<
  RecievedBoardMemberInterface,
  { board_id: number; board_member_email: string; token: string },
  { rejectValue: BackendValidationError[] }
>(
  "board/addboardmember",
  async (
    { token, board_id, board_member_email },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/boards/${board_id}/add-member`,
        {
          board_member_email: board_member_email,
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
        dispatch(setError(errorMessage));
        return rejectWithValue(errorMessage);
      }
      dispatch(setError([{ field: "server_error", msg: "Unknown error" }]));
      return rejectWithValue([{ field: "server_error", msg: "Unknown error" }]);
    }
  },
);

export const deleteBoardMember = createAsyncThunk<
  RecievedBoardMemberInterface,
  { board_id: number; member_id: number; token: string },
  { rejectValue: BackendValidationError[] }
>(
  "board/deleteboardmember",
  async ({ token, board_id, member_id }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/v1/boards/${board_id}/delete-member?member_id=${member_id}`,
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

export const {
  resetBoards,
  addBoardDirect,
  removeBoardDirect,
  updateBoardDirect,
} = boardSlice.actions;

export default boardSlice.reducer;
