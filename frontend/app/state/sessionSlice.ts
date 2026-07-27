import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
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

export interface Token {
  access_token: string;
  token_type: string;
}
export interface SessionErrors {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm: string;
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
    confirm: "",
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
      state.errors = {
        ...state.errors,
        ...action.payload,
      };
    },
    clearError: (state) => {
      state.errors = {
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm: "",
        server_error: "",
      };
    },
    clearStatus: (state) => {
      state.status = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signinUser.fulfilled, (state, action) => {
        state.status = LoadingStatus.fulfiled;
        // state.currentUser = action.payload as User;
        console.log(
          "WHAT DOES SUCCESSUFUL STATE RETURNS IN LOGIN?",
          action.payload,
        );
      })
      .addCase(signinUser.pending, (state) => {
        state.status = LoadingStatus.pending;
      })
      .addCase(signinUser.rejected, (state, action) => {
        state.status = LoadingStatus.rejected;
        if (action.payload) {
          action.payload.forEach((error) => {
            const field = error.field; //["body", "email"]
            console.log(action.payload);
            if (field in state.errors) {
              state.errors[field as keyof SessionErrors] = error.msg;
            } else {
              state.errors.server_error = error.msg;
            }
          });
        }
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.status = LoadingStatus.fulfiled;
        // state.currentUser = action.payload as User;
        console.log(
          "WHAT DOES SUCCESSUFUL STATE RETURNS IN REGISTER?",
          action.payload,
        );
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
            console.log(action.payload);
            if (field in state.errors) {
              state.errors[field as keyof SessionErrors] = error.msg;
            } else {
              state.errors.server_error = error.msg;
            }
          });
        }
        console.log("first_name", state.errors.first_name);
        console.log("last_name", state.errors.last_name);
        console.log("email", state.errors.email);
        console.log("password", state.errors.password);
        console.log("confirm", state.errors.confirm);
        console.log("server_error", state.errors.server_error);
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.status = LoadingStatus.fulfiled;
        state.currentUser = action.payload as User;
        console.log(
          "WHAT DOES SUCCESSUFUL STATE RETURNS IN GETCURRENTUSER?",
          action.payload,
        );
        console.log(
          "WHAT IS CURRENTUSER STATE AFTER SUCCESSUFUL GETCURRENTUSER?",
          action.payload,
        );
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.status = LoadingStatus.pending;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.status = LoadingStatus.rejected;
        if (action.payload) {
          action.payload.forEach((error) => {
            const field = error.field; //["body", "email"]
            console.log(action.payload);
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

export const signinUser = createAsyncThunk<
  Token,
  {
    email: string;
    password: string;
  },
  {
    rejectValue: BackendValidationError[];
  }
>("session/signin", async (credentials, { rejectWithValue }) => {
  try {
    const form = new URLSearchParams();

    form.append("username", credentials.email);
    form.append("password", credentials.password);
    form.append("grant_type", "password");

    const tokenResponse = await axios.post(
      "http://127.0.0.1:8000/api/auth/login",
      form,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    console.log(
      "WHAT DOES SUCCESSUFUL STATE RETURNS IN REGISTER? TOKENRESPONSE",
      tokenResponse.data.access_token,
    );

    return tokenResponse.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data.detail || []);
    }
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
    return rejectWithValue([{ field: "server_error", msg: "Unknown error" }]);
  }
});

export const getCurrentUser = createAsyncThunk<
  User,
  string,
  {
    rejectValue: BackendValidationError[];
  }
>("session/getcurrentuser", async (token, { rejectWithValue }) => {
  // if (!getToken()) {
  //   return rejectWithValue([
  //     { field: "server_error", msg: "Not authenticated." },
  //   ]);
  // }
  try {
    const response = await axios.get("http://127.0.0.1:8000/api/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(
      "WHAT DOES RESPONSE>DATA RETURNS IN GETCURRENTUSER",
      response.data,
    );
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const errorMessage = err.response?.data.detail || [];
      console.log(err.response?.data.detail);
      return rejectWithValue(errorMessage);
    }

    // return rejectWithValue("Unknown error");
    return rejectWithValue([{ field: "server_error", msg: "Unknown error" }]);
  }
});

export const { setCurrentUser, setSocket, setError, clearError, clearStatus } =
  sessionSlice.actions;

export default sessionSlice.reducer;
