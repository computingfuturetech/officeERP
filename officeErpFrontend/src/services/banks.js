import api from "../core/api"

export const getBanks = async (params) => {
    try {
        if (!params) {
            params = {};
        }
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null)
        );

        const queryString = new URLSearchParams(cleanParams).toString();

        const response = api.get(`/bank/get?${queryString}`);
        return response;
    } catch (error) {
        console.error("Error fetching banks:", error);
    }
}

export const createBank = async (data) => {
    try {
        const response = api.post("/bank/create", data);
        return response;
    } catch (error) {
        console.error("Error creating banks:", error);
    }
}

export const updateBank = async (id, data) => {
    try {
        const response = api.post(`/bank/update?id=${id}`, data);
        return response;
    } catch (error) {
        console.error("Error updating banks:", error);
    }
}