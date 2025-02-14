import api from "../core/api";

const cleanParams = (params) => {
    return Object.fromEntries(Object.entries(params || {}).filter(([_, v]) => v != null));
};

const fetchReport = async (endpoint, params) => {
    try {
        const queryString = new URLSearchParams(cleanParams(params)).toString();
        const response = await api.get(`/report/${endpoint}?${queryString}`, {
            responseType: "blob",
        });

        console.log(`${endpoint} Response: `, response);
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
    }
};

export const getBankLedger = (params) => fetchReport("bank-ledger", params);
export const getCashLedger = (params) => fetchReport("cash-ledger", params);
export const getGeneralLedger = (params) => fetchReport("general-ledger", params);
export const getIncomeRecord = (params) => fetchReport("income-record", params);
export const getBalanceSheet = (params) => fetchReport("balance-sheet", params);
