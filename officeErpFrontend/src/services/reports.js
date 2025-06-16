import api from "../core/api";

const cleanParams = (params) => {
    return Object.fromEntries(Object.entries(params || {}).filter(([_, v]) => v != null));
};

const fetchReport = async (endpoint, params, reportFormat) => {
    try {
        const queryString = new URLSearchParams(cleanParams(params)).toString();
        const response = await api.get(`/report/${endpoint}/${reportFormat}?${queryString}`, {
            responseType: "blob",
        });

        console.log(`${endpoint} Response: `, response);
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
    }
};

export const getBankLedger = (params, reportFormat) => fetchReport("bank-ledger", params, reportFormat);
export const getCashLedger = (params, reportFormat) => fetchReport("cash-ledger", params, reportFormat);
export const getGeneralLedger = (params, reportFormat) => fetchReport("general-ledger", params, reportFormat);
export const getIncomeRecord = (params, reportFormat) => fetchReport("income-record", params, reportFormat);
export const getBalanceSheet = (params, reportFormat) => fetchReport("balance-sheet", params, reportFormat);
