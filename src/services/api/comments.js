import apiClient from "./client";

export async function getIdeaComments(ideaId, params = {}) {
    const response = await apiClient.get(`/api/ideas/${ideaId}/comments`, { params });
    return response.data;
}

export async function createIdeaComment(ideaId, payload) {
    const response = await apiClient.post(`/api/ideas/${ideaId}/comments`, payload);
    return response.data;
}

export async function setCommentInteraction(commentId, state) {
    const response = await apiClient.put(`/api/comments/${commentId}/interactions`, {
        state,
    });
    return response.data;
}

export async function getMyComments(params = {}) {
    const response = await apiClient.get("/api/my-comments", { params });
    return response.data;
}