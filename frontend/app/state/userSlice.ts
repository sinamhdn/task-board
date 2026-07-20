import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

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

const userSlice = createSlice({
  name: "user",
  initialState: null as User | null,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      return action.payload;
    },
  },
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(
  //       loginUser.fulfilled,
  //       (state, action: PayloadAction<User>) => {
  //         state.currentUser = action.payload.user;
  //       },
  //     )
  //     .addCase(
  //       loginUser.rejected,
  //       (state, action: PayloadAction<User | null>) => {
  //         state.error = action.error.message;
  //       },
  //     );
  // },
});

export const loginUser = createAsyncThunk("user/login", async (credentials) => {
  const response = await fetch("127.0.0.1:8000/api/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  return response.json();
});

export const { setCurrentUser } = userSlice.actions;
export default userSlice.reducer;
