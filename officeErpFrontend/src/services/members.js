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

export const validateMembersFile = async (file, onUploadProgress) => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        // Initialize progress
        onUploadProgress?.(0);

        const response = await api.post("/member/validate-members", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.loaded && progressEvent.total) {
                    const realProgress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onUploadProgress?.(realProgress);
                } else {
                    // Fallback if total is undefined
                    onUploadProgress?.(50); // Arbitrary value to indicate progress is happening
                }
            },
        });

        // Ensure 100% progress on completion
        onUploadProgress?.(100);

        return response.data;
    } catch (error) {
        console.error("Error validating members file:", error);
        throw error;
    }
};
export const uploadMembersFile = async (file, onUploadProgress) => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        onUploadProgress?.(0); // Initialize progress

        const response = await api.post("/member/upload-members", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.loaded && progressEvent.total) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onUploadProgress?.(percentCompleted);
                } else {
                    onUploadProgress?.(50); // Fallback
                }
            },
        });

        onUploadProgress?.(100); // Ensure completion
        console.log("File uploaded successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error uploading members file:", error);
        throw error;
    }
};
export const downloadErrorFile = async (filePath) => {
    try {
        // Log the original filePath
        console.log("Original filePath:", filePath);

        // Remove any leading slashes and 'uploads/' (case-insensitive)
        const fileName = filePath.replace(/^\/|^uploads\//i, '');
        console.log("Processed fileName:", fileName);

        // Use direct file access endpoint
        const response = await api.get(`/uploads/${fileName}`, {
            responseType: 'blob',
            headers: {
                'Accept': 'application/octet-stream',
            },
        });

        // Log response details for debugging
        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);
        console.log("Response data type:", response.data?.type);

        // Check if response data is a valid blob
        if (!response.data || !(response.data instanceof Blob)) {
            throw new Error('Invalid or no file data received');
        }

        return response.data;
    } catch (error) {
        console.error("Error downloading error file:", error);
        if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response headers:", error.response.headers);
            // Attempt to parse error response if it's JSON
            if (error.response.data instanceof Blob) {
                const text = await error.response.data.text();
                console.error("Response body:", text);
            } else {
                console.error("Response body:", error.response.data);
            }
        }
        throw error;
    }
};