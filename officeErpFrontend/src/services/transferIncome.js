import api from "../core/api"

export const getTransferIncome = async (params) => {
    try {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null)
        );

        const queryString = new URLSearchParams(cleanParams).toString();

        const response = api.get(`/sellerPurchaser/get?${queryString}`);
        return response;
    } catch (error) {
        console.error("Error fetching members:", error);
    }
}

export const createTransferIncome = async (data) => {
    try {
        const response = api.post("/sellerPurchaser/create", data);
        return response;
    } catch (error) {
        console.error("Error creating member:", error);
    }
}

export const updateTransferIncome = async (id, data) => {
    try {
        const response = api.post(`/sellerPurchaser/update?id=${id}`, data);
        return response;
    } catch (error) {
        console.error("Error updating member:", error);
    }
}