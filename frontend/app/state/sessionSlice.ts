import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { setError } from "./errorSlice";

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

export interface Token {
  access_token: string;
  token_type: string;
}

export interface SessionState {
  currentUser: User | null;
  authStatus: string | null;
  userStatus: string | null;
}

export interface BackendValidationError {
  field: string;
  msg: string;
}

export const LoadingStatus = {
  fulfilled: "fulfilled",
  pending: "pending",
  rejected: "rejected",
};

const initialState: SessionState = {
  currentUser: null,
  authStatus: null,
  userStatus: null,
};

const sessionSlice = createSlice({
  name: "session",
  initialState: initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    setStatus: (state, action) => {
      state.authStatus = action.payload?.auth;
      state.userStatus = action.payload?.user;
    },
    clearStatus: (state) => {
      state.authStatus = null;
      state.userStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signinUser.fulfilled, (state, action) => {
        state.authStatus = LoadingStatus.fulfilled;
        // state.currentUser = action.payload as User;
        console.log(
          "sessionSlice.ts:: WHAT DOES SUCCESSUFUL STATE RETURNS IN LOGIN?",
          action.payload,
        );
      })
      .addCase(signinUser.pending, (state) => {
        state.authStatus = LoadingStatus.pending;
      })
      .addCase(signinUser.rejected, (state, action) => {
        state.authStatus = LoadingStatus.rejected;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.authStatus = LoadingStatus.fulfilled;
        // state.currentUser = action.payload as User;
        console.log(
          "sessionSlice.ts:: WHAT DOES SUCCESSUFUL STATE RETURNS IN REGISTER?",
          action.payload,
        );
      })
      .addCase(signupUser.pending, (state) => {
        state.authStatus = LoadingStatus.pending;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.authStatus = LoadingStatus.rejected;
        // console.log(action.payload);
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.userStatus = LoadingStatus.fulfilled;
        state.currentUser = action.payload as User;
        console.log(
          "sessionSlice.ts:: WHAT DOES SUCCESSUFUL STATE RETURNS IN GETCURRENTUSER?",
          action.payload,
        );
        console.log(
          "sessionSlice.ts:: WHAT IS CURRENTUSER STATE AFTER SUCCESSUFUL GETCURRENTUSER?",
          action.payload,
        );
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.userStatus = LoadingStatus.pending;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.userStatus = LoadingStatus.rejected;
      });
  },
});

export const signinUser = createAsyncThunk<
  Token,
  {
    email: string;
    password: string;
  },
  {
    rejectValue: BackendValidationError[];
  }
>("session/signin", async (credentials, { dispatch, rejectWithValue }) => {
  try {
    const form = new URLSearchParams();

    form.append("username", credentials.email);
    form.append("password", credentials.password);
    form.append("grant_type", "password");

    console.log(
      "sessionSlice.ts:: WHAT DOES SUCCESSUFUL STATE RETURNS IN REGISTER? TOKENRESPONSE",
      // tokenResponse.data.access_token,
    );

    const tokenResponse = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/auth/login`,
      form,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    return tokenResponse.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log("sessionSlice.ts:: ERROR MESSAGE", err);
      const errorMessage = err.response?.data.detail || [];
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
    dispatch(setError([{ field: "server_error", msg: "Unknown error" }]));
    return rejectWithValue([{ field: "server_error", msg: "Unknown error" }]);
  }
});

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
>("session/signup", async (credentials, { dispatch, rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/auth/register`,
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
      console.log("sessionSlice.ts::" + err.response?.data.detail);

      // return rejectWithValue(errorMessageString);
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }

    // return rejectWithValue("Unknown error");
    dispatch(setError([{ field: "server_error", msg: "Unknown error" }]));
    return rejectWithValue([{ field: "server_error", msg: "Unknown error" }]);
  }
});

export const getCurrentUser = createAsyncThunk<
  User,
  string,
  {
    rejectValue: BackendValidationError[];
  }
>("session/getcurrentuser", async (token, { dispatch, rejectWithValue }) => {
  // if (!getToken()) {
  //   return rejectWithValue([
  //     { field: "server_error", msg: "Not authenticated." },
  //   ]);
  // }
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/v1/users/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log(
      "sessionSlice.ts:: WHAT DOES RESPONSE>DATA RETURNS IN GETCURRENTUSER",
      response.data,
    );
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const errorMessage = err.response?.data.detail || [];
      console.log("sessionSlice.ts::" + err.response?.data.detail);
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }

    // return rejectWithValue("Unknown error");
    dispatch(setError([{ field: "server_error", msg: "Unknown error" }]));
    return rejectWithValue([{ field: "server_error", msg: "Unknown error" }]);
  }
});

export const { setCurrentUser, clearCurrentUser, setStatus, clearStatus } =
  sessionSlice.actions;

export default sessionSlice.reducer;
