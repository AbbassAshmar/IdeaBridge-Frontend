import apiClient from "./client";
import { endpoints } from "./endpoints";

export async function getCategories() {
  const response = await apiClient.get(endpoints.GET_CATEGORIES());
  return response.data;
}
