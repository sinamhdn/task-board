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
import { setError } from "./errorSlice";

const logger = log.getLogger("CARD SLICE LOGGER");
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
    resetCards: (state) => {
      state.cardsByList = {};
      state.getAllCardsLoadingStatusByList = {};
      state.getCardByIdLoadingStatus = null;
      state.createNewCardLoadingStatus = null;
      state.updateCardLoadingStatus = null;
      state.deleteCardLoadingStatus = null;
    },
    addCardDirect: (
      state,
      action: PayloadAction<{ listId: number; card: CardRecievedInterface }>,
    ) => {
      const { listId, card } = action.payload;
      if (!state.cardsByList[listId]) state.cardsByList[listId] = [];
      if (!state.cardsByList[listId].some((c) => c.id === card.id))
        state.cardsByList[listId].push(card);
    },
    removeCardDirect: (
      state,
      action: PayloadAction<{ listId: number; card: CardRecievedInterface }>,
    ) => {
      const { listId, card } = action.payload;
      if (!state.cardsByList[listId]) return;
      state.cardsByList[listId] = state.cardsByList[listId].filter(
        (c) => c.id !== card.id,
      );
    },
    updateCardDirect: (
      state,
      action: PayloadAction<{ listId: number; card: CardRecievedInterface }>,
    ) => {
      console.log(
        `updateCardDirect what does it recieve --> ${action.payload}`,
        action.payload,
      );
      const { listId, card } = action.payload;
      if (!state.cardsByList[listId]) return;
      const cardIndex = state.cardsByList[listId].findIndex(
        (c) => c.id === card.id,
      );
      state.cardsByList[listId][cardIndex] = card;
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
        const listId = action.meta.arg.listId;
        if (
          !state.cardsByList[listId].some(
            (card) => card.id === action.payload.id,
          )
        ) {
          state.cardsByList[listId].push(action.payload);
        }
      })
      .addCase(getCardById.pending, (state) => {
        state.getCardByIdLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(getCardById.rejected, (state) => {
        state.getCardByIdLoadingStatus = LoadingStatusEnum.rejected;
      })
      .addCase(createNewCard.fulfilled, (state, action) => {
        state.createNewCardLoadingStatus = LoadingStatusEnum.fulfilled;
        const listId = action.meta.arg.listId;
        if (!state.cardsByList[listId]) state.cardsByList[listId] = [];
        if (
          !state.cardsByList[listId].some((c) => c.id === action.payload.id)
        ) {
          state.cardsByList[listId].push(action.payload);
        }
      })
      .addCase(createNewCard.pending, (state) => {
        state.createNewCardLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(createNewCard.rejected, (state) => {
        state.createNewCardLoadingStatus = LoadingStatusEnum.rejected;
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        state.updateCardLoadingStatus = LoadingStatusEnum.fulfilled;
        const listId = action.payload.list_id;
        const arr = state.cardsByList[listId];
        if (!arr) return;
        const i = arr.findIndex((c) => c.id === action.payload.id);
        if (i !== -1) arr[i] = action.payload;
      })
      .addCase(updateCard.pending, (state) => {
        state.updateCardLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(updateCard.rejected, (state) => {
        state.updateCardLoadingStatus = LoadingStatusEnum.rejected;
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        state.deleteCardLoadingStatus = LoadingStatusEnum.fulfilled;
        const { listId, cardId } = action.meta.arg; // listId is already in the thunk arg
        const arr = state.cardsByList[listId];
        if (arr) state.cardsByList[listId] = arr.filter((c) => c.id !== cardId);
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
        console.log("cardSlice.ts::" + error.response?.data.detail);
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
        console.log("cardSlice.ts::" + error.response?.data.detail);
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
    logger.info(
      "createNewCard ",
      "CARDNAME:",
      cardName,
      " BOARD ID:",
      boardId,
      " LIST ID:",
      listId,
    );
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
        console.log("cardSlice.ts::" + error);
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
        logger.info("cardSlice.ts::updateError::", error.response?.data.detail);
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
        console.log("cardSlice.ts::" + error);
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
