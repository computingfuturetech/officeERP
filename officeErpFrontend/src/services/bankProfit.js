import api from "../core/api"

export const getBankProfit = async (params) => {
    try {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null)
        );

        const queryString = new URLSearchParams(cleanParams).toString();

        const response = api.get(`/bankProfit/get?${queryString}`);
        return response;
    } catch (error) {
        console.error("Error fetching members:", error);
    }
}

export const createBankProfit = async (data) => {
    try {
        const response = api.post("/bankProfit/create", data);
        return response;
    } catch (error) {
        console.error("Error creating member:", error);
    }
}

export const updateBankProfit = async (id, data) => {
    try {
        const response = api.post(`/bankProfit/update?id=${id}`, data);
        return response;
    } catch (error) {
        console.error("Error updating member:", error);
    }
}