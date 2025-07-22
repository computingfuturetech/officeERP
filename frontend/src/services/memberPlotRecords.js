import { cleanParams } from "@/utils/commonUtils";
import api from "../core/api";
const BASE_URL = import.meta.env.VITE_BASE_URL;
import axios from "axios";

export const getMemberPlotRecords = async (params = {}) => {
  const queryString = new URLSearchParams(cleanParams(params)).toString();
  const response = api.get(`/member-plot-records?${queryString}`);
  return response;
};

export const createMemberPlotRecord = async (data) => {
  const response = api.post("/member-plot-records", data);
  return response;
};

export const updateMemberPlotRecord = async (id, data) => {
  const response = api.patch(`/member-plot-records/${id}`, data);
  return response;
};

export const transferPlot = async (data) => {
  const response = api.post(`/member-plot-records/transfer`, data);
  return response;
};

export const validateMemberPlotRecordsFile = async (file, onUploadProgress) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    // Initialize progress
    onUploadProgress?.(0);

    const response = await api.post(
      "/member-plot-records/bulk/validate",
      formData,
      {
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
      }
    );

    // Ensure 100% progress on completion
    onUploadProgress?.(100);

    return response;
  } catch (error) {
    console.error("Error validating members file:", error);
    throw error;
  }
};

export const uploadMemberPlotRecordsFile = async (file, onUploadProgress) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    onUploadProgress?.(0); // Initialize progress

    const response = await api.post(
      "/member-plot-records/bulk/upload",
      formData,
      {
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
      }
    );

    onUploadProgress?.(100); // Ensure completion
    return response;
  } catch (error) {
    console.error("Error uploading members file:", error);
    throw error;
  }
};

export const downloadMemberPlotRecordsErrorFile = async (fileUrl) => {
  try {
    // Use direct file access endpoint
    const response = await axios.get(`${BASE_URL}${fileUrl}`, {
      responseType: "blob",
      headers: {
        Accept: "application/octet-stream",
      },
    });

    // Check if response data is a valid blob
    if (!response.data || !(response.data instanceof Blob)) {
      throw new Error("Invalid or no file data received");
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
