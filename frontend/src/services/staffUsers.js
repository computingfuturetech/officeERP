import api from "../core/api";

export const getStaffUsers = async (params) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null)
  );
  const queryString = new URLSearchParams(cleanParams).toString();

  const response = api.get(`/staff-users?${queryString}`);
  return response;
};

export const createStaffUser = async (data) => {
  const response = api.post("/staff-users", data);
  return response;
};

export const updateStaffUser = async (id, data) => {
  const response = api.patch(`/staff-users/${id}`, data);
  return response;
};
