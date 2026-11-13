import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthFormErrorInterface, ErrorStateInterface } from "~/state";

type FieldError = { field: string | string[]; msg: string };

const initialState: { errors: ErrorStateInterface } = {
  errors: {
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
    board_list_add_field_errors: {
      list_name: "",
    },
    board_card_add_field_errors: {
      card_name: "",
    },
    server_error: "",
    ws_error: "",
  },
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
      reducer: (state, action: PayloadAction<FieldError[]>) => {
        if (!action.payload) return;
        for (const error of action.payload) {
          const field = Array.isArray(error.field)
            ? error.field.at(-1)!
            : error.field; //["body", "email"]
          if (field in state.errors.auth_field_errors) {
            state.errors.auth_field_errors[
              field as keyof AuthFormErrorInterface
            ] = error.msg;
          } else if (field in state.errors.board_add_field_errors) {
            state.errors.board_add_field_errors[
              field as keyof { board_name: string }
            ] = error.msg;
          } else if (field in state.errors.board_member_add_field_errors) {
            state.errors.board_member_add_field_errors[
              field as keyof { board_member_email: string }
            ] = error.msg;
          } else if (field in state.errors.board_list_add_field_errors) {
            state.errors.board_list_add_field_errors[
              field as keyof { list_name: string }
            ] = error.msg;
          } else if (field in state.errors.board_card_add_field_errors) {
            state.errors.board_card_add_field_errors[
              field as keyof { card_name: string }
            ] = error.msg;
          } else {
            state.errors.server_error = error.msg;
          }
        }
      },
    },
    clearError: () => initialState,
  },
});

export const { setError, clearError } = errorSlice.actions;

export default errorSlice.reducer;
