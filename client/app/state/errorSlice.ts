import { createSlice } from "@reduxjs/toolkit";

export interface ErrorState {
  auth_field_errors: { [key: string]: string | undefined };
  board_add_field_errors: { [key: string]: string | undefined };
  board_member_add_field_errors: { [key: string]: string | undefined };
  server_error?: string;
  ws_error?: string;
}

export interface AuthFormErrorInterface {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm: string;
}

const initialState: ErrorState = {
  auth_field_errors: {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm: "",
  },
  board_add_field_errors: {
    board_name: "",
  },
  board_member_add_field_errors: {
    board_member_email: "",
  },
  server_error: "",
  ws_error: "",
};

const errorSlice = createSlice({
  name: "errors",
  initialState: initialState,
  reducers: {
    setError: {
      prepare: (errorMessage) => ({
        payload: errorMessage,
        meta: {},
        error: true,
      }),
      reducer: (state, action) => {
        if (action.payload) {
          action.payload.forEach((error: { field: string; msg: string }) => {
            const field = error.field; //["body", "email"]
            if (field in state.auth_field_errors) {
              state.auth_field_errors[field as keyof AuthFormErrorInterface] =
                error.msg;
            } else if (field in state.board_add_field_errors) {
              state.board_add_field_errors[
                field as keyof { board_name: string }
              ] = error.msg;
            } else if (field in state.board_member_add_field_errors) {
              state.board_member_add_field_errors[
                field as keyof { board_member_email: string }
              ] = error.msg;
            } else {
              state.server_error = error.msg;
            }
          });
        }
        state = {
          ...state,
          ...action.payload,
        };
      },
    },
    clearError: (state) => {
      state = {
        ...state,
        auth_field_errors: {
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          confirm: "",
        },
        server_error: "",
        ws_error: "",
      };
    },
  },
});

export const { setError, clearError } = errorSlice.actions;

export default errorSlice.reducer;
