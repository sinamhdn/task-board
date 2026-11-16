import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import {
  LoadingStatusEnum,
  type BackendValidationErrorInterface,
  type ListRecievedInterface,
} from "~/state";
import { axios_base } from "~/utils/api";
import log from "~/utils/logger";
import { setError } from "./error-slice";

const logger = log.getLogger("list-slice logger");
logger.setLevel(import.meta.env.DEV ? "debug" : "warn");

const initialState: {
  getAllListsLoadingStatus: string | null;
  getListByIdLoadingStatus: string | null;
  createNewListLoadingStatus: string | null;
  updateListLoadingStatus: string | null;
  deleteListLoadingStatus: string | null;
  boardId: number;
  lists: ListRecievedInterface[];
} = {
  getAllListsLoadingStatus: null,
  getListByIdLoadingStatus: null,
  createNewListLoadingStatus: null,
  updateListLoadingStatus: null,
  deleteListLoadingStatus: null,
  boardId: 0,
  lists: [],
};

const listSlice = createSlice({
  name: "list",
  initialState: initialState,
  reducers: {
    resetLists: () => initialState,
    addListDirect: (state, action: PayloadAction<ListRecievedInterface>) => {
      const { id } = action.payload;
      if (state.lists.some((l) => l.id === id)) return;
      state.lists.push(action.payload);
    },
    removeListDirect: (state, action: PayloadAction<{ id: number }>) => {
      // state.lists = state.lists.filter((list) => list.id !== action.payload.id);
      const { id } = action.payload;
      const index = state.lists.findIndex((l) => l.id === id);
      if (index === -1) return;
      state.lists.splice(index, 1);
    },
    updateListDirect: (state, action: PayloadAction<ListRecievedInterface>) => {
      const { id } = action.payload;
      const index = state.lists.findIndex((l) => l.id === id);
      if (index === -1) return;
      state.lists[index] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllLists.fulfilled, (state, action) => {
        state.getAllListsLoadingStatus = LoadingStatusEnum.fulfilled;
        state.boardId = action.meta.arg.boardId;
        state.lists = action.payload;
      })
      .addCase(getAllLists.pending, (state) => {
        state.getAllListsLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(getAllLists.rejected, (state) => {
        state.getAllListsLoadingStatus = LoadingStatusEnum.rejected;
      })
      .addCase(getListById.fulfilled, (state, action) => {
        state.getListByIdLoadingStatus = LoadingStatusEnum.fulfilled;
        const { id, board_id: boardId } = action.payload;
        if (state.lists.some((l) => l.id === id)) return;
        state.boardId = boardId;
        state.lists.push(action.payload);
      })
      .addCase(getListById.pending, (state) => {
        state.getListByIdLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(getListById.rejected, (state) => {
        state.getListByIdLoadingStatus = LoadingStatusEnum.rejected;
      })
      .addCase(createNewList.fulfilled, (state, action) => {
        state.createNewListLoadingStatus = LoadingStatusEnum.fulfilled;
        const { id, board_id: boardId } = action.payload;
        if (state.lists.some((l) => l.id === id)) return;
        state.boardId = boardId;
        state.lists.push(action.payload);
      })
      .addCase(createNewList.pending, (state) => {
        state.createNewListLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(createNewList.rejected, (state) => {
        state.createNewListLoadingStatus = LoadingStatusEnum.rejected;
      })
      .addCase(updateList.fulfilled, (state, action) => {
        state.updateListLoadingStatus = LoadingStatusEnum.fulfilled;
        const { id, board_id: boardId } = action.payload;
        const index = state.lists.findIndex((l) => l.id === id);
        if (index === -1) return;
        state.boardId = boardId;
        state.lists[index] = action.payload;
      })
      .addCase(updateList.pending, (state) => {
        state.updateListLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(updateList.rejected, (state) => {
        state.updateListLoadingStatus = LoadingStatusEnum.rejected;
      })
      .addCase(deleteList.fulfilled, (state, action) => {
        state.deleteListLoadingStatus = LoadingStatusEnum.fulfilled;
        const { id } = action.payload;
        const index = state.lists.findIndex((l) => l.id === id);
        if (index === -1) return;
        state.lists.splice(index, 1);
      })
      .addCase(deleteList.pending, (state) => {
        state.deleteListLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(deleteList.rejected, (state) => {
        state.deleteListLoadingStatus = LoadingStatusEnum.rejected;
      });
  },
});

export const getAllLists = createAsyncThunk<
  ListRecievedInterface[],
  {
    skip?: number;
    limit?: number;
    order?: string;
    token: string;
    boardId: number;
  },
  { rejectValue: BackendValidationErrorInterface[] }
>(
  "list/alllists",
  async (
    { token, boardId, skip, limit, order },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await axios_base.get(`/api/v1/lists`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          board_id: boardId,
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
          "list-slice: getAllLists -> error.response?.data.detail = ",
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

export const getListById = createAsyncThunk<
  ListRecievedInterface,
  { boardId: number; listId: number; token: string },
  { rejectValue: BackendValidationErrorInterface[] }
>(
  "list/listbyid",
  async ({ token, boardId, listId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios_base.get(`/api/v1/lists/${listId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          board_id: boardId,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data.detail || [];
        logger.error(
          "list-slice: getListById -> error.response?.data.detail = ",
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

export const createNewList = createAsyncThunk<
  ListRecievedInterface,
  { listName: string; boardId: number; token: string },
  { rejectValue: BackendValidationErrorInterface[] }
>(
  "list/newlist",
  async ({ token, listName, boardId }, { dispatch, rejectWithValue }) => {
    logger.info("list-slice: createNewList -> listName = ", listName);
    try {
      const response = await axios_base.post(
        `/api/v1/lists`,
        {
          board_id: boardId,
          list_name: listName,
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
        logger.error("list-slice: createNewList -> error = ", error);
        dispatch(setError(errorMessage));
        return rejectWithValue(errorMessage);
      }
      dispatch(setError([{ field: "server_error", msg: "Unknown error" }]));
      return rejectWithValue([{ field: "server_error", msg: "Unknown error" }]);
    }
  },
);

export const updateList = createAsyncThunk<
  ListRecievedInterface,
  { listId: number; token: string; listName: string; boardId: number },
  { rejectValue: BackendValidationErrorInterface[] }
>(
  "list/updatelist",
  async (
    { token, listId, listName, boardId },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await axios_base.patch(
        `/api/v1/lists/${listId}`,
        { list_name: listName, board_id: boardId },
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
          "list-slice: updateList -> error.response?.data.detail = ",
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

export const deleteList = createAsyncThunk<
  ListRecievedInterface,
  { boardId: number; listId: number; token: string },
  { rejectValue: BackendValidationErrorInterface[] }
>(
  "list/deletelist",
  async ({ token, boardId, listId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios_base.delete(`/api/v1/lists/${listId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          board_id: boardId,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data.detail || [];
        logger.error("list-slice: deleteList -> error = ", error);
        dispatch(setError(errorMessage));
        return rejectWithValue(errorMessage);
      }
      dispatch(setError([{ field: "server_error", msg: "Unknown error" }]));
      return rejectWithValue([{ field: "server_error", msg: "Unknown error" }]);
    }
  },
);

export const { resetLists, addListDirect, removeListDirect, updateListDirect } =
  listSlice.actions;

export default listSlice.reducer;
