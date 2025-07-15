import axios from "axios";
import store from "../redux/store";
import { toast } from "@/components/hooks/use-toast";
import { refreshUserToken, removeUser } from "../redux/user/user";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = store?.getState()?.user?.token ?? null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const noRetryUrls = ["/staff-users/login", "/staff-users/refresh-token"];

    toast({
      title: "Error",
      description:
        error?.response?.data?.message || "An unexpected error occurred.",
      variant: "destructive",
    });

    if (
      !noRetryUrls.includes(originalRequest.url) &&
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const { data } = await api.get("/staff-users/refresh-token");
        store.dispatch(refreshUserToken(data));

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        store.dispatch(removeUser());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
