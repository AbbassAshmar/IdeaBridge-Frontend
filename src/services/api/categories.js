import apiClient from "./client";

export async function getCategories() {
  const response = await apiClient.get("/api/categories");
  return response.data;
}
