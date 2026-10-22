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
      if (state.cards.find((card) => card.id === action.payload.id)) return;
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
  },
  { rejectValue: BackendValidationErrorInterface[] }
>(
  "card/allcards",
  async (
    { token, boardId, skip, limit, order },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/lists`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            board_id: boardId,
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
  { boardId: number; listId: number; token: string },
  { rejectValue: BackendValidationErrorInterface[] }
>(
  "card/cardbyid",
  async ({ token, boardId, listId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/lists/${listId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            board_id: boardId,
          },
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data.detail || [];
        console.log("listSlice.ts::" + error.response?.data.detail);
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
  { listName: string; boardId: number; token: string },
  { rejectValue: BackendValidationErrorInterface[] }
>(
  "card/newcard",
  async ({ token, listName, boardId }, { dispatch, rejectWithValue }) => {
    console.log("createNewBoard name", listName);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/lists`,
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
  { listId: number; token: string; listName: string; boardId: number },
  { rejectValue: BackendValidationErrorInterface[] }
>(
  "card/updatecard",
  async (
    { token, listId, listName, boardId },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/v1/lists/${listId}`,
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
  { boardId: number; listId: number; token: string },
  { rejectValue: BackendValidationErrorInterface[] }
>(
  "card/deletecard",
  async ({ token, boardId, listId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/v1/boards/${listId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            board_id: boardId,
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
