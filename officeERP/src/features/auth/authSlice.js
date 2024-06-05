import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    isAuthenticated: false,
    user: null,
    isLoading: true,
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
      state.isAuthenticated = !!action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.token = null;
      localStorage.removeItem("token");
      state.isAuthenticated = false;
      state.user = null;
    },
    checkTokenExpiration: (state) => {
      const jwt_token = localStorage.getItem("token");
      if (jwt_token) {
        const token = jwt_token;
        const jwtpayload = JSON.parse(window.atob(token.split(".")[1]));
        if (jwtpayload.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          state.isLoading = false;
        }else{
            state.isLoading = false;
        }
      } else {
        state.isLoading = false;
        window.location.href = "/login";
      }
    },
  },
});

export const { setToken, setUser, logout, checkTokenExpiration } =
  authSlice.actions;

export default authSlice.reducer;
