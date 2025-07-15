import { cleanParams } from "@/utils/commonUtils";
import api from "../core/api";

export const getAccounts = async (params = {}) => {
  const queryString = new URLSearchParams(cleanParams(params)).toString();
  const response = await api.get(`/accounts?${queryString}`);
  return response;
};

export const createAccount = async (data) => {
  const response = await api.post("/accounts", data);
  return response;
};

export const updateAccount = async (id, data) => {
  const response = await api.patch(`/accounts/${id}`, data);
  return response;
};

export const deleteAccount = async (id, data) => {
  const response = await api.delete(`/accounts/${id}`, data);
  return response;
};
