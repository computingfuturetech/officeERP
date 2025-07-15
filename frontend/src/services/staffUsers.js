import { cleanParams } from "@/utils/commonUtils";
import api from "../core/api";

export const getStaffUsers = async (params = {}) => {
  const queryString = new URLSearchParams(cleanParams(params)).toString();
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
