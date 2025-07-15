import { cleanParams } from "@/utils/commonUtils";
import api from "../core/api";

export const getVouchers = async (params = {}) => {
  const queryString = new URLSearchParams(cleanParams(params)).toString();
  const response = await api.get(`/vouchers?${queryString}`);
  return response;
};

export const createVoucher = async (data) => {
  const response = await api.post("/vouchers", data);
  return response;
};

export const updateVoucher = async (id, data) => {
  const response = await api.patch(`/vouchers/${id}`, data);
  return response;
};

export const deleteVoucher = async (id) => {
  const response = await api.delete(`/vouchers/${id}`);
  return response;
};
