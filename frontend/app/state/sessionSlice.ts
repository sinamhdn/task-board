import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios"

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
  initialState: initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
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
      .addCase(signinUser.fulfilled, (state, action) => {
        state.currentUser = action.payload.user;
      })
      .addCase(signinUser.rejected, (state, action) => {
        state.error = action.error.message || "Login Failed!";
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.currentUser = action.payload.user as User;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.error = action.error.message || "Registration Failed!";
      });
  },
});

export const signinUser = createAsyncThunk(
  "session/signin",
  async (credentials) => {
    const response = await fetch("127.0.0.1:8000/api/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    return response.json();
  },
);

export const signupUser = createAsyncThunk(
  "session/signup",
  async (credentials) => {
    try{
    const response = await axios.post("127.0.0.1:8000/api/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
    return response;
    }catch(err){
      return err
    }
  },
);

export const { setCurrentUser, setSocket, setError, clearError } =
  sessionSlice.actions;

export default sessionSlice.reducer;
