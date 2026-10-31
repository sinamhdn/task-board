import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  LoadingStatusEnum,
  type BackendValidationErrorInterface,
  type CardRecievedInterface,
} from "~/state";
import { setError } from "./errorSlice";

const initialState: {
  getAllCardsLoadingStatus: string | null;
  getCardByIdLoadingStatus: string | null;
  createNewCardLoadingStatus: string | null;
  updateCardLoadingStatus: string | null;
  deleteCardLoadingStatus: string | null;
  cards: CardRecievedInterface[];
} = {
  getAllCardsLoadingStatus: null,
  getCardByIdLoadingStatus: null,
  createNewCardLoadingStatus: null,
  updateCardLoadingStatus: null,
  deleteCardLoadingStatus: null,
  cards: [],
};

const cardSlice = createSlice({
  name: "card",
  initialState: initialState,
  reducers: {
    resetLists: (state) => {
      state.cards = [];
      state.getAllCardsLoadingStatus = null;
      state.getCardByIdLoadingStatus = null;
      state.createNewCardLoadingStatus = null;
      state.updateCardLoadingStatus = null;
      state.deleteCardLoadingStatus = null;
    },
    addCardDirect: (state, action) => {
      if (state.cards.find((card) => card.list_id === action.payload.list_id)) return;
      state.cards.push(action.payload);
    },
    removeCardDirect: (state, action) => {
      state.cards = state.cards.filter((card) => card.id !== action.payload.id);
    },
    updateCardDirect: (state, action) => {
      console.log(
        `updateCardDirect what does it recieve --> ${action.payload}`,
        action.payload,
      );
      const cardIndex = state.cards.findIndex(
        (card) => card.id === action.payload.id,
      );
      state.cards[cardIndex] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllCards.fulfilled, (state, action) => {
        state.getAllCardsLoadingStatus = LoadingStatusEnum.fulfilled;
        state.cards = action.payload;
      })
      .addCase(getAllCards.pending, (state) => {
        state.getAllCardsLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(getAllCards.rejected, (state, action) => {
        state.getAllCardsLoadingStatus = LoadingStatusEnum.rejected;
      })
      .addCase(getCardById.fulfilled, (state, action) => {
        state.getCardByIdLoadingStatus = LoadingStatusEnum.fulfilled;
        state.cards.push(action.payload);
      })
      .addCase(getCardById.pending, (state) => {
        state.getCardByIdLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(getCardById.rejected, (state, action) => {
        state.getCardByIdLoadingStatus = LoadingStatusEnum.rejected;
      })
      .addCase(createNewCard.fulfilled, (state, action) => {
        state.createNewCardLoadingStatus = LoadingStatusEnum.fulfilled;
        state.cards.push(action.payload);
      })
      .addCase(createNewCard.pending, (state) => {
        state.createNewCardLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(createNewCard.rejected, (state, action) => {
        state.createNewCardLoadingStatus = LoadingStatusEnum.rejected;
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        state.updateCardLoadingStatus = LoadingStatusEnum.fulfilled;
        const cardIndex = state.cards.findIndex(
          (card) => card.id === action.payload.id,
        );
        state.cards[cardIndex] = action.payload;
      })
      .addCase(updateCard.pending, (state) => {
        state.updateCardLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(updateCard.rejected, (state, action) => {
        state.updateCardLoadingStatus = LoadingStatusEnum.rejected;
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        state.deleteCardLoadingStatus = LoadingStatusEnum.fulfilled;
        const cardId = action.meta.arg.cardId; // from the original thunk call
        state.cards = state.cards.filter((card) => card.id !== cardId);
      })
      .addCase(deleteCard.pending, (state) => {
        state.deleteCardLoadingStatus = LoadingStatusEnum.pending;
      })
      .addCase(deleteCard.rejected, (state, action) => {
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
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/cards`,
        {
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
        },
      );
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
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/cards/${cardId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            board_id: boardId,
            list_id: listId,
          },
        },
      );
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
    console.log("createNewCard name", cardName);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/cards`,
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
    listId: number;
    token: string;
    cardName: string;
    boardId: number;
    cardId: number;
  },
  { rejectValue: BackendValidationErrorInterface[] }
>(
  "card/updatecard",
  async (
    { token, listId, cardName, boardId, cardId },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/v1/cards/${cardId}`,
        { card_name: cardName, list_id: listId, board_id: boardId },
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
        console.log("cardSlice.ts::" + error.response?.data.detail);
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
  { boardId: number; listId: number; token: string; cardId: number },
  { rejectValue: BackendValidationErrorInterface[] }
>(
  "card/deletecard",
  async ({ token, boardId, listId, cardId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/v1/cards/${cardId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            board_id: boardId,
            list_id: listId,
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

export const { resetLists, addCardDirect, removeCardDirect, updateCardDirect } =
  cardSlice.actions;

export default cardSlice.reducer;
