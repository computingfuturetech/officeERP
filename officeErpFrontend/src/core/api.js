import axios from "axios";
import store from "../redux/store";
import { toast } from "@/components/hooks/use-toast";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
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
    (error) => {
        if (error.response) {
            toast({
                title: "Error",
                description: error?.response?.data?.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        } else {
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive",
            });
        }
        return Promise.reject(error);
    }
);

export default api;