import store from "../redux/store";
import api from "../core/api";
import { setUser } from "..//redux/user/user";

export const login = async (email, password) => {
  const response = await api.post("/staff-users/login", {
    email,
    password,
  });
  store.dispatch(setUser(response?.data?.data));
  return response;
};
