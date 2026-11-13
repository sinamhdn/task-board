import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type {
  RecievedSearchUsersInterface,
  SearchStateInterface,
} from "~/state";
import { axios_base } from "~/utils/api";
import { setError } from "./errorSlice";

const initialState: SearchStateInterface = {
  userEmailSearchResults: [],
  isLoading: false,
  query: "",
};

const searchSlice = createSlice({
  name: "search",
  initialState: initialState,
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
      return state;
    },
    clearQuery: (state) => {
      state.userEmailSearchResults = [];
      state.isLoading = false;
      state.query = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userEmailSearchResults = action.payload;
      })
      .addCase(searchUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchUsers.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const searchUsers = createAsyncThunk<
  RecievedSearchUsersInterface[],
  { query: string },
  { rejectValue: { field: string; msg: string }[] }
>("board/searchusers", async ({ query }, { dispatch, rejectWithValue }) => {
  try {
    const response = await axios_base.get(
      `/api/v1/search?search_type=user&limit=20&query=${query}`,
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
});

export const { setQuery, clearQuery } = searchSlice.actions;

export default searchSlice.reducer;
