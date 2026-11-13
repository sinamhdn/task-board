import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  LoadingStatusEnum,
  type BackendValidationErrorInterface,
  type BoardMemberRecievedInterface,
} from "~/state";
import { axios_base } from "~/utils/api";
import log from "~/utils/logger";
import { setError } from "./errorSlice";

const logger = log.getLogger("BOARD MEMBER SLICE LOGGER");
logger.setLevel(import.meta.env.DEV ? "debug" : "warn");

const initialState: {
  getAllBoardMembersLoadingStatus: string | null;
  addBoardMemberLoadingStatus: string | null;
  deleteBoardMemberLoadingStatus: string | null;
  boardId: number;
  boardMembers: BoardMemberRecievedInterface[];
} = {
  getAllBoardMembersLoadingStatus: null,
  addBoardMemberLoadingStatus: null,
  deleteBoardMemberLoadingStatus: null,
  boardId: 0,
  boardMembers: [],
};

const boardMemberSlice = createSlice({
  name: "board-member",
  initialState: initialState,
  reducers: {
    resetBoardMembers: (state) => {
      state.boardMembers = [];
      state.getAllBoardMembersLoadingStatus = null;
      state.addBoardMemberLoadingStatus = null;
      state.deleteBoardMemberLoadingStatus = null;
    },
    addBoardMemberDirect: (state, action) => {
      if (state.boardMembers.find((member) => member.id === action.payload.id))
        return;
      state.boardMembers.push(action.payload);
    },
    removeBoardMemberDirect: (state, action) => {
      state.boardMembers = state.boardMembers.filter(
        (member) => member.id !== action.payload.id,
      );
    },
    updateBoardDirect: (state, action) => {
      logger.info(
        `updateBoardDirect what does it recieve --> ${action.payload}`,
        action.payload,
      );
      const boardIndex = state.boardMembers.findIndex(
        (member) => member.id === action.payload.id,
      );
      state.boardMembers[boardIndex] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllBoardMembers.fulfilled, (state, action) => {
        state.addBoardMemberLoadingStatus = LoadingStatusEnum.fulfilled;
        logger.info(`GET ALL BOARD MEMBERS FULFILLED`);
        logger.info(`GET ALL BOARD MEMBERS ACTION: ${action}`);
        state.boardId = action.meta.arg.boardId;
        state.boardMembers = action.payload;
      })
      .addCase(getAllBoardMembers.pending, (state) => {
        state.addBoardMemberLoadingStatus = LoadingStatusEnum.pending;
        logger.info(`GET ALL BOARD MEMBERS PENDING`);
      })
      .addCase(getAllBoardMembers.rejected, (state) => {
        state.addBoardMemberLoadingStatus = LoadingStatusEnum.rejected;
        logger.info(`GET ALL BOARD MEMBERS REJECTED`);
      })
      .addCase(addBoardMember.fulfilled, (state, action) => {
        state.addBoardMemberLoadingStatus = LoadingStatusEnum.fulfilled;
        /*
        const newMember = action.payload; // Assuming this is the added member
        const boardId = action.meta.arg.board_id; // every arg passed to the thunk will be here
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
          */
        const boardId = action.meta.arg.boardId;
        if (boardId === state.boardId) {
          state.boardMembers.push(action.payload);
          logger.info("✅ Member added successfully ✅");
        } else {
          logger.warn("Board not found in state:", boardId);
        }
      })
      .addCase(addBoardMember.pending, (state) => {
        state.addBoardMemberLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(addBoardMember.rejected, (state) => {
        state.addBoardMemberLoadingStatus = LoadingStatusEnum.rejected;
      })
      .addCase(deleteBoardMember.fulfilled, (state, action) => {
        state.deleteBoardMemberLoadingStatus = LoadingStatusEnum.fulfilled;
        /* 
        const deletedMemberId = action.payload.id;
        const boardId = action.meta.arg.board_id;
        const board = state.boards.find((board) => board.id === boardId);
        if (board) {
          board.members = board.members.filter(
            (member) => member.id !== deletedMemberId,
          );
        }
          */
        const boardId = action.meta.arg.boardId;
        if (boardId === state.boardId) {
          state.boardMembers = state.boardMembers.filter(
            (member) => member.id !== action.payload.id,
          );
          logger.info("❎ Member deleted successfully ❎");
        } else {
          logger.warn("Board not found in state:", boardId);
        }
      })
      .addCase(deleteBoardMember.pending, (state) => {
        state.deleteBoardMemberLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(deleteBoardMember.rejected, (state) => {
        state.deleteBoardMemberLoadingStatus = LoadingStatusEnum.rejected;
      });
  },
});

export const getAllBoardMembers = createAsyncThunk<
  BoardMemberRecievedInterface[],
  { boardId: number; token: string },
  { rejectValue: BackendValidationErrorInterface[] }
>(
  "board/allboardmembers",
  async ({ token, boardId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios_base.get(`/api/v1/boards/${boardId}/members`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data.detail || [];
        logger.info("boardMemberSlice.ts::" + error.response?.data.detail);
        dispatch(setError(errorMessage));
        return rejectWithValue(errorMessage);
      }
      dispatch(setError([{ field: "server_error", msg: "Unknown error" }]));
      return rejectWithValue([{ field: "server_error", msg: "Unknown error" }]);
    }
  },
);

export const addBoardMember = createAsyncThunk<
  BoardMemberRecievedInterface,
  { boardId: number; boardMemberEmail: string; token: string },
  { rejectValue: BackendValidationErrorInterface[] }
>(
  "board/addboardmember",
  async (
    { token, boardId, boardMemberEmail },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await axios_base.post(
        `/api/v1/boards/${boardId}/add-member`,
        {
          board_member_email: boardMemberEmail,
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
  BoardMemberRecievedInterface,
  { boardId: number; memberId: number; token: string },
  { rejectValue: BackendValidationErrorInterface[] }
>(
  "board/deleteboardmember",
  async ({ token, boardId, memberId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios_base.delete(
        `/api/v1/boards/${boardId}/delete-member`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            member_id: memberId,
          },
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data.detail || [];
        logger.info("boardMemberSlice.ts::" + error);
        dispatch(setError(errorMessage));
        return rejectWithValue(errorMessage);
      }
      dispatch(setError([{ field: "server_error", msg: "Unknown error" }]));
      return rejectWithValue([{ field: "server_error", msg: "Unknown error" }]);
    }
  },
);

export const {
  resetBoardMembers,
  addBoardMemberDirect,
  removeBoardMemberDirect,
  updateBoardDirect,
} = boardMemberSlice.actions;

export default boardMemberSlice.reducer;
