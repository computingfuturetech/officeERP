import api from "../core/api"

export const getStaffUsers = async (params) => {
    try {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null)
        );

        const queryString = new URLSearchParams(cleanParams).toString();

        const response = api.get(`/user/get?${queryString}`);
        return response;
    } catch (error) {
        console.error("Error fetching StaffUsers:", error);
    }
}

export const createStaffUser = async (data) => {
    try {
        const response = api.post("/user/create", data);
        return response;
    } catch (error) {
        console.error("Error creating StaffUser:", error);
    }
}

export const updateStaffUser = async (id, data) => {
    try {
        const response = api.post(`/user/update?id=${id}`, data);
        return response;
    } catch (error) {
        console.error("Error updating StaffUser:", error);
    }
}