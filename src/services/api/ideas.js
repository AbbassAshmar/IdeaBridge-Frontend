import apiClient from "./client";

export async function getIdeas(params = {}) {
  const response = await apiClient.get("/api/ideas", { params });
  return response.data;
}

export async function getUserIdeas(params = {}) {
  const response = await apiClient.get("/api/users/ideas", { params });
  return response.data;
}

export async function createIdea(payload) {
  const response = await apiClient.post("/api/ideas", payload);
  return response.data;
}

export async function setIdeaInteraction(ideaId, state) {
  const response = await apiClient.put(`/api/ideas/${ideaId}/interactions`, {
    state,
  });
  return response.data;
}
