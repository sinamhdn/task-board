import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

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
export interface SessionErrors {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirm: string;
  server_error: string;
}

export interface SessionState {
  currentUser: User | null;
  socket: WebSocket | null;
  errors: SessionErrors;
  status: string | null;
}

interface BackendValidationError {
  field: string;
  msg: string;
}

export const LoadingStatus = {
  fulfiled: "fulfiled",
  pending: "pending",
  rejected: "rejected",
};

const initialState: SessionState = {
  currentUser: null,
  socket: null,
  errors: {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirm: "",
    server_error: "",
  },
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
      state.errors = action.payload;
    },
    clearError: (state) => {
      state.errors = initialState.errors;
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
        state.errors.server_error = action.error.message || "Login Failed!";
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.status = LoadingStatus.fulfiled;
        state.currentUser = action.payload as User;
      })
      .addCase(signupUser.pending, (state) => {
        state.status = LoadingStatus.pending;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.status = LoadingStatus.rejected;
        // console.log(action.payload);
        if (action.payload) {
          action.payload.forEach((error) => {
            const field = error.field; //["body", "email"]
            if (field in state.errors) {
              state.errors[field as keyof SessionErrors] = error.msg;
            } else {
              state.errors.server_error = error.msg;
            }
          });
        }
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

export const signupUser = createAsyncThunk<
  User,
  {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  },
  {
    rejectValue: BackendValidationError[];
  }
>("session/signup", async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/auth/register",
      credentials,
    );
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      // const errorMessageString =
      //   err.response?.data.detail
      //     ?.map((error: { msg: string }) => error.msg)
      //     .join("\n") || err.message;
      const errorMessage = err.response?.data.detail || [];
      console.log(err.response?.data.detail);

      // return rejectWithValue(errorMessageString);
      return rejectWithValue(errorMessage);
    }

    // return rejectWithValue("Unknown error");
    return rejectWithValue([]);
  }
});

export const { setCurrentUser, setSocket, setError, clearError } =
  sessionSlice.actions;

export default sessionSlice.reducer;
