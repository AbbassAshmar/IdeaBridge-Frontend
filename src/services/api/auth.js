import apiClient from "./client";

async function ensureCsrfCookie() {
  await apiClient.get("/sanctum/csrf-cookie");
}

export async function login(payload) {
  await ensureCsrfCookie();
  const response = await apiClient.post("/api/auth/login", payload);
  return response.data;
}

export async function register(payload) {
  await ensureCsrfCookie();
  const response = await apiClient.post("/api/auth/register", payload);
  return response.data;
}

export async function logout() {
  await ensureCsrfCookie();
  const response = await apiClient.post("/api/auth/logout");
  return response.data;
}

export async function getCurrentUser() {
  const response = await apiClient.get("/api/auth/user");
  return response.data;
}
