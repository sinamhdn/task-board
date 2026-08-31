import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { setError } from "./errorSlice";

interface RecievedSearchUsersInterface {
  id: number;
  uid: string;
  email: string;
  full_name: string;
  image_file?: string;
  image_path?: string;
}

interface InitialStateInterface {
  userEmailSearchResults: RecievedSearchUsersInterface[];
  isLoading: boolean;
  query: string;
}

const initialState: InitialStateInterface = {
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userEmailSearchResults = action.payload;
        console.log(
          "search results:::  ",
          action.payload,
          state.userEmailSearchResults,
        );
      })
      .addCase(searchUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isLoading = false;
      });
  },
});

export const searchUsers = createAsyncThunk<
  RecievedSearchUsersInterface[],
  { query: string },
  { rejectValue: { field: string; msg: string }[] }
>("board/allboards", async ({ query }, { dispatch, rejectWithValue }) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/v1/search?search_type=user&limit=20&query=${query}`,
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

export const { setQuery } = searchSlice.actions;

export default searchSlice.reducer;
