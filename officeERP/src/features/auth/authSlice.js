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
    checkTokenExpiration: (state, action) => {
      const jwt_token = localStorage.getItem("token");

      if (jwt_token) {
        const token = jwt_token;
        const jwtpayload = JSON.parse(window.atob(token.split(".")[1]));

        if (jwtpayload.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else {
          const requestedUrl = window.location.pathname;
          if (
            requestedUrl === "/" ||
            requestedUrl === "/login" ||
            requestedUrl === "/otp" ||
            requestedUrl === "/new-password" ||
            requestedUrl === "/forgot-password"
          ) {
            if (requestedUrl !== "/dashboard") {
              window.location.href = "/dashboard";
            }
          }
        }
      } else {
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }

      state.isLoading = false;
    },
  },
});

export const { setToken, setUser, logout, checkTokenExpiration } =
  authSlice.actions;

export default authSlice.reducer;
