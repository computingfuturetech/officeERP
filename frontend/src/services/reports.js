import { cleanParams } from "@/utils/commonUtils";
import api from "../core/api";

const fetchReport = async (endpoint, params = {}) => {
  try {
    const queryString = new URLSearchParams(cleanParams(params)).toString();
    const response = await api.get(`/reports/${endpoint}?${queryString}`, {
      responseType: "blob",
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

export const getGeneralLedger = (params) =>
  fetchReport("general-ledger", params);
export const getIncomeStatement = (params) =>
  fetchReport("income-statement", params);
export const getBalanceSheet = (params) =>
  fetchReport("balance-sheet", params);
