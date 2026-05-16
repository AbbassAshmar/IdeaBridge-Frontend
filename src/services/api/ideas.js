import apiClient from "./client";

export async function getIdeas(params = {}) {
  const response = await apiClient.get("/api/ideas", { params });
  return response.data;
}

export async function getIdeaById(ideaId) {
  const response = await apiClient.get(`/api/ideas/${ideaId}`);
  return response.data;
}

export async function getUserIdeas(params = {}) {
  const response = await apiClient.get("/api/users/ideas", { params });
  return response.data;
}

export async function getDeveloperIdeas() {
  const response = await apiClient.get("/api/users/developer-ideas");
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

export async function takeIdea(ideaId) {
  const response = await apiClient.post(`/api/ideas/${ideaId}/take`);
  return response.data;
}

export async function leaveIdea(ideaId) {
  const response = await apiClient.post(`/api/ideas/${ideaId}/leave`);
  return response.data;
}

export async function completeIdea(ideaId) {
  const response = await apiClient.post(`/api/ideas/${ideaId}/complete`);
  return response.data;
}

export async function getIdeaUpdates(ideaId) {
  const response = await apiClient.get(`/api/ideas/${ideaId}/updates`);
  return response.data;
}

export async function createIdeaUpdate(ideaId, payload) {
  const response = await apiClient.post(`/api/ideas/${ideaId}/updates`, payload);
  return response.data;
}
