import api from "../core/api"

export const getWaterMaintenance = async (params) => {
    try {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null)
        );

        const queryString = new URLSearchParams(cleanParams).toString();

        const response = api.get(`/waterMaintenanceBill/get?${queryString}`);
        return response;
    } catch (error) {
        console.error("Error fetching members:", error);
    }
}

export const createWaterMaintenance = async (data) => {
    try {
        const response = api.post("/waterMaintenanceBill/create", data);
        return response;
    } catch (error) {
        console.error("Error creating member:", error);
    }
}

export const updateWaterMaintenance = async (id, data) => {
    try {
        const response = api.post(`/waterMaintenanceBill/update?id=${id}`, data);
        return response;
    } catch (error) {
        console.error("Error updating member:", error);
    }
}