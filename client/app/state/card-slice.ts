import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import {
  LoadingStatusEnum,
  type BackendValidationErrorInterface,
  type CardRecievedInterface,
} from "~/state";
import { axios_base } from "~/utils/api";
import log from "~/utils/logger";
import { setError } from "./error-slice";

const logger = log.getLogger("card-slice logger");
logger.setLevel(import.meta.env.DEV ? "debug" : "warn");

const initialState: {
  getAllCardsLoadingStatusByList: Record<number, string>;
  getCardByIdLoadingStatus: string | null;
  createNewCardLoadingStatus: string | null;
  updateCardLoadingStatus: string | null;
  deleteCardLoadingStatus: string | null;
  boardId: number;
  cardsByList: Record<number, CardRecievedInterface[]>;
} = {
  getAllCardsLoadingStatusByList: {},
  getCardByIdLoadingStatus: null,
  createNewCardLoadingStatus: null,
  updateCardLoadingStatus: null,
  deleteCardLoadingStatus: null,
  boardId: 0,
  cardsByList: {},
};

const cardSlice = createSlice({
  name: "card",
  initialState: initialState,
  reducers: {
    resetCards: () => initialState,
    addCardDirect: (state, action: PayloadAction<CardRecievedInterface>) => {
      const { list_id, id } = action.payload;
      if (!state.cardsByList[list_id]) state.cardsByList[list_id] = [];
      if (state.cardsByList[list_id].some((c) => c.id === id)) return;
      state.cardsByList[list_id].push(action.payload);
    },
    removeCardDirect: (
      state,
      action: PayloadAction<{ id: number; listId: number }>,
    ) => {
      const { listId, id } = action.payload;
      if (!state.cardsByList[listId]) return;
      const index = state.cardsByList[listId].findIndex((c) => c.id === id);
      if (index === -1) return;
      state.cardsByList[listId].splice(index, 1);
    },
    updateCardDirect: (state, action: PayloadAction<CardRecievedInterface>) => {
      const { list_id, id } = action.payload;
      if (!state.cardsByList[list_id]) return;
      const index = state.cardsByList[list_id].findIndex((c) => c.id === id);
      if (index === -1) return;
      state.cardsByList[list_id][index] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllCards.fulfilled, (state, action) => {
        const listId = action.meta.arg.listId;
        state.getAllCardsLoadingStatusByList[listId] =
          LoadingStatusEnum.fulfilled;
        state.boardId = action.meta.arg.boardId;
        state.cardsByList[listId] = action.payload;
      })
      .addCase(getAllCards.pending, (state, action) => {
        state.getAllCardsLoadingStatusByList[action.meta.arg.listId] =
          LoadingStatusEnum.pending;
      })
      .addCase(getAllCards.rejected, (state, action) => {
        state.getAllCardsLoadingStatusByList[action.meta.arg.listId] =
          LoadingStatusEnum.rejected;
      })
      .addCase(getCardById.fulfilled, (state, action) => {
        state.getCardByIdLoadingStatus = LoadingStatusEnum.fulfilled;
        const { id, list_id: listId, board_id: boardId } = action.payload;
        if (state.cardsByList[listId].some((c) => c.id === id)) return;
        state.boardId = boardId;
        state.cardsByList[listId].push(action.payload);
      })
      .addCase(getCardById.pending, (state) => {
        state.getCardByIdLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(getCardById.rejected, (state) => {
        state.getCardByIdLoadingStatus = LoadingStatusEnum.rejected;
      })
      .addCase(createNewCard.fulfilled, (state, action) => {
        state.createNewCardLoadingStatus = LoadingStatusEnum.fulfilled;
        const { id, list_id: listId, board_id: boardId } = action.payload;
        if (!state.cardsByList[listId]) state.cardsByList[listId] = [];
        if (state.cardsByList[listId].some((c) => c.id === id)) return;
        state.boardId = boardId;
        state.cardsByList[listId].push(action.payload);
      })
      .addCase(createNewCard.pending, (state) => {
        state.createNewCardLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(createNewCard.rejected, (state) => {
        state.createNewCardLoadingStatus = LoadingStatusEnum.rejected;
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        state.updateCardLoadingStatus = LoadingStatusEnum.fulfilled;
        const { id, list_id: listId, board_id: boardId } = action.payload;
        const index = state.cardsByList[listId].findIndex((c) => c.id === id);
        if (index === -1) return;
        state.boardId = boardId;
        state.cardsByList[listId][index] = action.payload;
      })
      .addCase(updateCard.pending, (state) => {
        state.updateCardLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(updateCard.rejected, (state) => {
        state.updateCardLoadingStatus = LoadingStatusEnum.rejected;
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        state.deleteCardLoadingStatus = LoadingStatusEnum.fulfilled;
        const { id, list_id: listId } = action.payload;
        const index = state.cardsByList[listId].findIndex((c) => c.id === id);
        if (index === -1) return;
        state.cardsByList[listId].splice(index, 1);
      })
      .addCase(deleteCard.pending, (state) => {
        state.deleteCardLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(deleteCard.rejected, (state) => {
        state.deleteCardLoadingStatus = LoadingStatusEnum.rejected;
      });
  },
});

export const getAllCards = createAsyncThunk<
  CardRecievedInterface[],
  {
    skip?: number;
    limit?: number;
    order?: string;
    token: string;
    boardId: number;
    listId: number;
  },
  { rejectValue: BackendValidationErrorInterface[] }
>(
  "card/allcards",
  async (
    { token, boardId, listId, skip, limit, order },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await axios_base.get(`/api/v1/cards`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          board_id: boardId,
          list_id: listId,
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
          "card-slice: getAllCards -> error.response?.data.detail = " +
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

export const getCardById = createAsyncThunk<
  CardRecievedInterface,
  { boardId: number; listId: number; cardId: number; token: string },
  { rejectValue: BackendValidationErrorInterface[] }
>(
  "card/cardbyid",
  async ({ token, boardId, listId, cardId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios_base.get(`/api/v1/cards/${cardId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          board_id: boardId,
          list_id: listId,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data.detail || [];
        logger.error(
          "card-slice: getCardById -> error.response?.data.detail = " +
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

export const createNewCard = createAsyncThunk<
  CardRecievedInterface,
  { cardName: string; boardId: number; listId: number; token: string },
  { rejectValue: BackendValidationErrorInterface[] }
>(
  "card/newcard",
  async (
    { token, cardName, boardId, listId },
    { dispatch, rejectWithValue },
  ) => {
    logger.info("card-slice: createNewCard -> cardName = ", cardName);
    logger.info("card-slice: createNewCard -> boardId = ", boardId);
    logger.info("card-slice: createNewCard -> listId = ", listId);
    try {
      const response = await axios_base.post(
        `/api/v1/cards`,
        {
          board_id: boardId,
          list_id: listId,
          card_name: cardName,
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
        logger.error("card-slice: createNewCard -> error = ", error);
        dispatch(setError(errorMessage));
        return rejectWithValue(errorMessage);
      }
      dispatch(setError([{ field: "server_error", msg: "Unknown error" }]));
      return rejectWithValue([{ field: "server_error", msg: "Unknown error" }]);
    }
  },
);

export const updateCard = createAsyncThunk<
  CardRecievedInterface,
  {
    cardId: number;
    cardName: string;
    boardId: number;
    listId: number;
    token: string;
  },
  { rejectValue: BackendValidationErrorInterface[] }
>(
  "card/updatecard",
  async (
    { token, listId, cardName, cardId, boardId },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await axios_base.patch(
        `/api/v1/cards/${cardId}`,
        { card_name: cardName, board_id: boardId, list_id: listId },
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
          "card-slice: updateCard -> error.response?.data.detail = ",
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

export const deleteCard = createAsyncThunk<
  CardRecievedInterface,
  { boardId: number; listId: number; cardId: number; token: string },
  { rejectValue: BackendValidationErrorInterface[] }
>(
  "card/deletecard",
  async ({ token, boardId, listId, cardId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios_base.delete(`/api/v1/cards/${cardId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          board_id: boardId,
          list_id: listId,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data.detail || [];
        logger.error("card-slice: deleteCard -> error = " + error);
        dispatch(setError(errorMessage));
        return rejectWithValue(errorMessage);
      }
      dispatch(setError([{ field: "server_error", msg: "Unknown error" }]));
      return rejectWithValue([{ field: "server_error", msg: "Unknown error" }]);
    }
  },
);

export const { resetCards, addCardDirect, removeCardDirect, updateCardDirect } =
  cardSlice.actions;

export default cardSlice.reducer;
