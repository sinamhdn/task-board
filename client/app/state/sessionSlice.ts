import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  LoadingStatusEnum,
  type BackendValidationErrorInterface,
  type SessionStateInterface,
  type TokenRecievedInterface,
  type UserRecievedInterface,
} from "~/state";
import { axios_base } from "~/utils/api";
import { fetchCurrentUser } from "~/utils/auth";
import log from "~/utils/logger";
import { setError } from "./errorSlice";

const logger = log.getLogger("BOARD MEMBER SLICE LOGGER");
logger.setLevel(import.meta.env.DEV ? "debug" : "warn");

const initialState: SessionStateInterface = {
  websocket: null,
  currentUser: null,
  authStatus: null,
  userStatus: null,
};

const sessionSlice = createSlice({
  name: "session",
  initialState: initialState,
  reducers: {
    setCurrentUser: (
      state,
      action: PayloadAction<UserRecievedInterface | null>,
    ) => {
      state.currentUser = action.payload;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    setStatus: (state, action) => {
      state.authStatus = action.payload?.auth;
      state.userStatus = action.payload?.user;
    },
    clearSessionStatus: (state) => {
      state.authStatus = null;
      state.userStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signinUser.fulfilled, (state, action) => {
        state.authStatus = LoadingStatusEnum.fulfilled;
        // state.currentUser = action.payload as User;
        console.log(
          "sessionSlice.ts:: WHAT DOES SUCCESSUFUL STATE RETURNS IN LOGIN?",
          action.payload,
        );
      })
      .addCase(signinUser.pending, (state) => {
        state.authStatus = LoadingStatusEnum.pending;
      })
      .addCase(signinUser.rejected, (state) => {
        state.authStatus = LoadingStatusEnum.rejected;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.authStatus = LoadingStatusEnum.fulfilled;
        // state.currentUser = action.payload as User;
        console.log(
          "sessionSlice.ts:: WHAT DOES SUCCESSUFUL STATE RETURNS IN REGISTER?",
          action.payload,
        );
      })
      .addCase(signupUser.pending, (state) => {
        state.authStatus = LoadingStatusEnum.pending;
      })
      .addCase(signupUser.rejected, (state) => {
        state.authStatus = LoadingStatusEnum.rejected;
        // console.log(action.payload);
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.userStatus = LoadingStatusEnum.fulfilled;
        state.currentUser = action.payload as UserRecievedInterface;
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
        state.userStatus = LoadingStatusEnum.pending;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.userStatus = LoadingStatusEnum.rejected;
      });
  },
});

export const signinUser = createAsyncThunk<
  TokenRecievedInterface,
  {
    email: string;
    password: string;
  },
  {
    rejectValue: BackendValidationErrorInterface[];
  }
>("session/signin", async (credentials, { dispatch, rejectWithValue }) => {
  try {
    const form = new URLSearchParams();

    form.append("username", credentials.email);
    form.append("password", credentials.password);
    form.append("grant_type", "password");

    const tokenResponse = await axios_base.post(
      `/api/v1/auth/login`,
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
  UserRecievedInterface,
  {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  },
  {
    rejectValue: BackendValidationErrorInterface[];
  }
>("session/signup", async (credentials, { dispatch, rejectWithValue }) => {
  try {
    const response = await axios_base.post(
      `/api/v1/auth/register`,
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
  UserRecievedInterface,
  string,
  {
    rejectValue: BackendValidationErrorInterface[];
  }
>("session/getcurrentuser", async (token, { dispatch, rejectWithValue }) => {
  // if (!getToken()) {
  //   return rejectWithValue([
  //     { field: "server_error", msg: "Not authenticated." },
  //   ]);
  // }
  try {
    return await fetchCurrentUser(token);
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

export const {
  setCurrentUser,
  clearCurrentUser,
  setStatus,
  clearSessionStatus,
} = sessionSlice.actions;

export default sessionSlice.reducer;
