import api from "../core/api";

const cleanParams = (params) => {
  return Object.fromEntries(
    Object.entries(params || {}).filter(([_, v]) => v != null)
  );
};

const fetchReport = async (endpoint, params) => {
  try {
    const queryString = new URLSearchParams(cleanParams(params)).toString();
    const response = await api.get(`/reports/${endpoint}?${queryString}`, {
      responseType: "blob",
    });

    console.log(`${endpoint} Response: `, response);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

export const getGeneralLedger = (params, reportFormat) =>
  fetchReport("general-ledger", params);
export const getIncomeStatement = (params, reportFormat) =>
  fetchReport("income-statement", params);
export const getBalanceSheet = (params, reportFormat) =>
  fetchReport("balance-sheet", params);
