import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export function getErrorMessage(error, fallback = "Something went wrong.") {
  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message;
  }

  if (error?.message) {
    return error.message;
  }

  return fallback;
}

export function getValidationErrors(error) {
  return error?.response?.data?.error?.details || {};
}

export default apiClient;
