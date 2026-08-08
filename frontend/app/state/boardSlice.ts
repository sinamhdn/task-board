import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { setError } from "./errorSlice";

export interface RecievedBoards {
  id: number;
  uid: string;
  name: string;
  updated_at: string;
  created_at: string;
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

const initialState: { LoadingStatus: string | null } = {
  LoadingStatus: null,
};

const boardSlice = createSlice({
  name: "board",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllBoards.fulfilled, (state, action) => {
        state.LoadingStatus = LoadingStatus.fulfilled;
        // state.currentUser = action.payload as User;
        console.log(
          "sessionSlice.ts:: WHAT DOES SUCCESSUFUL STATE RETURNS IN LOGIN?",
          action.payload,
        );
      })
      .addCase(getAllBoards.pending, (state) => {
        state.LoadingStatus = LoadingStatus.pending;
      })
      .addCase(getAllBoards.rejected, (state, action) => {
        state.LoadingStatus = LoadingStatus.rejected;
      });
  },
});

export const getAllBoards = createAsyncThunk<
  RecievedBoards,
  { skip: number; limit: number; order: string; token: string },
  { rejectValue: BackendValidationError[] }
>(
  "board/getall",
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
      return response;
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

export default boardSlice.reducer;
