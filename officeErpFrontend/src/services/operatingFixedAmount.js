import api from "../core/api"

export const getOperatingFixedAssets = async (params) => {
    try {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null)
        );

        const queryString = new URLSearchParams(cleanParams).toString();

        const response = api.get(`/operatingFixedAssets/get?${queryString}`);
        return response;
    } catch (error) {
        console.error("Error fetching members:", error);
    }
}

export const createOperatingFixedAssets = async (data) => {
    try {
        const response = api.post("/operatingFixedAssets/create", data);
        return response;
    } catch (error) {
        console.error("Error creating member:", error);
    }
}

export const updateOperatingFixedAssets = async (id, data) => {
    try {
        const response = api.post(`/operatingFixedAssets/create?id=${id}`, data);
        return response;
    } catch (error) {
        console.error("Error updating member:", error);
    }
}