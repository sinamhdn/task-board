import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import {
  LoadingStatusEnum,
  type BackendValidationErrorInterface,
  type BoardMemberRecievedInterface,
} from "~/state";
import { axios_base } from "~/utils/api";
import log from "~/utils/logger";
import { setError } from "./error-slice";

const logger = log.getLogger("board-member-slice logger");
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

// because redux toolkit uses immer it is more efficient to mutate the state value instead of setting state value completely
// NOTE:: never set whole state variable
const boardMemberSlice = createSlice({
  name: "board-member",
  initialState: initialState,
  reducers: {
    resetBoardMembers: () => initialState,
    addBoardMemberDirect: (
      state,
      action: PayloadAction<BoardMemberRecievedInterface>,
    ) => {
      // if (state.boardMembers.find((member) => member.id === action.payload.id))
      //   return;
      if (state.boardMembers.some((member) => member.id === action.payload.id))
        return;
      state.boardMembers.push(action.payload);
    },
    removeBoardMemberDirect: (state, action: PayloadAction<{ id: number }>) => {
      // splice is better than filter if you use immer
      // state.boardMembers = state.boardMembers.filter(
      //   (member) => member.id !== action.payload.id,
      // );
      const index = state.boardMembers.findIndex(
        (m) => m.id === action.payload.id,
      );
      if (index === -1) return;
      state.boardMembers.splice(index, 1);
    },
    updateBoardMemberDirect: (
      state,
      action: PayloadAction<BoardMemberRecievedInterface>,
    ) => {
      // if (!state.boardMembers.find((member) => member.id === action.payload.id))
      //   return;
      const index = state.boardMembers.findIndex(
        (m) => m.id === action.payload.id,
      );
      if (index === -1) return;
      state.boardMembers[index] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllBoardMembers.fulfilled, (state, action) => {
        state.getAllBoardMembersLoadingStatus = LoadingStatusEnum.fulfilled;
        state.boardId = action.meta.arg.boardId;
        state.boardMembers = action.payload;
      })
      .addCase(getAllBoardMembers.pending, (state) => {
        state.getAllBoardMembersLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(getAllBoardMembers.rejected, (state) => {
        state.getAllBoardMembersLoadingStatus = LoadingStatusEnum.rejected;
      })
      .addCase(addBoardMember.fulfilled, (state, action) => {
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
        state.addBoardMemberLoadingStatus = LoadingStatusEnum.fulfilled;
        const { boardId } = action.meta.arg;

        if (boardId !== state.boardId) {
          return;
        }

        if (state.boardMembers.some((m) => m.id === action.payload.id)) {
          return;
        }

        state.boardMembers.push(action.payload);
      })
      .addCase(addBoardMember.pending, (state) => {
        state.addBoardMemberLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(addBoardMember.rejected, (state) => {
        state.addBoardMemberLoadingStatus = LoadingStatusEnum.rejected;
      })
      .addCase(deleteBoardMember.fulfilled, (state, action) => {
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
        state.deleteBoardMemberLoadingStatus = LoadingStatusEnum.fulfilled;
        const { boardId, memberId } = action.meta.arg;

        if (boardId !== state.boardId) {
          return;
        }

        const index = state.boardMembers.findIndex((m) => m.id === memberId);

        if (index === -1) {
          return;
        }

        state.boardMembers.splice(index, 1);
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
      const response = await axios_base.get(
        `/api/v1/boards/${boardId}/members`,
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
        logger.info(
          "board-member-slice: getAllBoardMembers -> error.response?.data.detail = ",
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
        logger.info(
          "board-member-slice: deleteBoardMember -> error.response?.data.detail = ",
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

export const {
  resetBoardMembers,
  addBoardMemberDirect,
  removeBoardMemberDirect,
  updateBoardMemberDirect,
} = boardMemberSlice.actions;

export default boardMemberSlice.reducer;
