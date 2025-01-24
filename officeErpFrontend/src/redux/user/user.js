import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    name: null,
    email: null,
    role: null,
    token: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.name = action?.payload?.name ?? null;
            state.email = action?.payload?.email ?? null;
            state.role = action?.payload?.role ?? null;
            state.token = action?.payload?.token ?? null;
        },
        removeUser: (state) => {
            state.name = null;
            state.email = null;
            state.role = null;
            state.token = null;
        },
    },
});

export const { setUser, removeUser } = userSlice.actions;
export default userSlice.reducer;