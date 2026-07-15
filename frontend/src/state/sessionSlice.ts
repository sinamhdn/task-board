import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface User {
  id: number;
  uid: string;
  full_name: string;
  image_file?: string;
  image_path?: string;
  email?: string;
  is_active?: boolean;
  is_verified?: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionState {
  currentUser: User | null;
  socket: WebSocket | null;
  error: string | null;
  isLoading: boolean;
}

const initialState: SessionState = {
  currentUser: null,
  socket: null,
  error: null,
  isLoading: false,
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.currentUser = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const loginUser = createAsyncThunk(
  "session/login",
  async (credentials) => {
    const response = await fetch("127.0.0.1:8000/api/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    return response.json();
  },
);

export const { setCurrentUser, setSocket, setError, clearError } =
  sessionSlice.actions;

export default sessionSlice.reducer;
