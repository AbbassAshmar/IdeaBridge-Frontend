import apiClient from "./client";
import { endpoints } from "./endpoints";

async function ensureCsrfCookie() {
  	await apiClient.get(endpoints.CSRF_COOKIE());
}

export async function login(payload) {
	await ensureCsrfCookie();
	const response = await apiClient.post(endpoints.LOGIN(), payload);
	return response.data;
}

export async function register(payload) {
	await ensureCsrfCookie();
	const response = await apiClient.post(endpoints.REGISTER(), payload);
	return response.data;
}

export async function logout() {
	await ensureCsrfCookie();
	const response = await apiClient.post(endpoints.LOGOUT());
	return response.data;
}

export async function getCurrentUser() {
	const response = await apiClient.get(endpoints.GET_CURRENT_USER());
	return response.data;
}
