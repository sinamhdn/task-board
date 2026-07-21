import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { error } from "console";

const LoadingStatus = {
  fulfiled: "fulfiled",
  pending: "pending",
  rejected: "rejected",
};

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
  status: string | null;
}

const initialState: SessionState = {
  currentUser: null,
  socket: null,
  error: null,
  status: null,
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
        state.status = LoadingStatus.fulfiled;
        state.currentUser = action.payload.user;
      })
      .addCase(signinUser.pending, (state) => {
        state.status = LoadingStatus.pending;
      })
      .addCase(signinUser.rejected, (state, action) => {
        state.status = LoadingStatus.rejected;
        state.error = action.error.message || "Login Failed!";
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.status = LoadingStatus.fulfiled;
        state.currentUser = action.payload.user as User;
      })
      .addCase(signupUser.pending, (state) => {
        state.status = LoadingStatus.pending;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.status = LoadingStatus.rejected;
        state.error = action.error.message || "Registration Failed!";
      });
  },
});

export const signinUser = createAsyncThunk(
  "session/signin",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const form = new URLSearchParams();

      form.append("username", credentials.email);
      form.append("password", credentials.password);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/login",
        form,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data);
      }
      return rejectWithValue("Unknown error");
    }
  },
);

export const signupUser = createAsyncThunk(
  "session/signup",
  async (credentials: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) => {
    try {
      console.log(credentials);
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/register",
        credentials,
      );
      return response;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log(err);
      }
      return err;
    }
  },
);

export const { setCurrentUser, setSocket, setError, clearError } =
  sessionSlice.actions;

export default sessionSlice.reducer;
