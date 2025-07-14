import api from "../core/api";

export const getVouchers = async (params) => {
  if (!params) {
    params = {};
  }
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null)
  );

  const queryString = new URLSearchParams(cleanParams).toString();

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