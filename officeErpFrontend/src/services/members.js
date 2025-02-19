import api from "../core/api"

export const getMembers = async (params) => {
    try {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null)
        );

        const queryString = new URLSearchParams(cleanParams).toString();

        const response = api.get(`/member/getMemberList?${queryString}`);
        return response;
    } catch (error) {
        console.error("Error fetching members:", error);
    }
}
export const getDelistedMembers = async (params) => {
    try {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null)
        );

        const queryString = new URLSearchParams(cleanParams).toString();

        const response = api.get(`/member/getDelistedMemberList?${queryString}`);
        return response;
    } catch (error) {
        console.error("Error fetching members:", error);
    }
}

export const createMember = async (data) => {
    try {
        const response = api.post("/member/create", data);
        return response;
    } catch (error) {
        console.error("Error creating member:", error);
    }
}

export const updateMember = async (id, data) => {
    try {
        const response = api.post(`/member/update?id=${id}`, data);
        return response;
    } catch (error) {
        console.error("Error updating member:", error);
    }
}

export const transferMembership = async (id, data) => {
    try {
        const response = api.post(`/member/transferMembership?id=${id}`, data);
        return response;
    } catch (error) {
        console.error("Error transferring member:", error);
    }
}