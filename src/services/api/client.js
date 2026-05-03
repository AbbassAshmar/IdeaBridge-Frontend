import axios from "axios";

const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	withCredentials: true,
	xsrfCookieName: "XSRF-TOKEN",
	xsrfHeaderName: "X-XSRF-TOKEN",

	headers: {
		Accept: "application/json",
		"Content-Type": "application/json",
	},
});

apiClient.interceptors.request.use((config) => {
	const match = document.cookie
		.split("; ")
		.find(c => c.startsWith("XSRF-TOKEN="));

	if (match) {
		const token = decodeURIComponent(match.split("=")[1]);

		config.headers["X-XSRF-TOKEN"] = token;
	}

	return config;
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
