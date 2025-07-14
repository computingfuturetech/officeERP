import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: null,
  email: null,
  role: null,
  token: null,
  permissions: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.name = action?.payload?.user?.name ?? null;
      state.email = action?.payload?.user?.email ?? null;
      state.role = action?.payload?.user?.role ?? null;
      state.token = action?.payload?.accessToken ?? null;
      state.permissions = action?.payload?.permissions ?? [];
    },
    removeUser: (state) => {
      state.name = null;
      state.email = null;
      state.role = null;
      state.token = null;
      state.permissions = [];
    },
    refreshUserToken: (state, action) => {
      state.token = action?.payload?.role ?? null;
    },
  },
});

export const { setUser, removeUser, refreshUserToken } = userSlice.actions;
export default userSlice.reducer;
