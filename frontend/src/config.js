export const API_BASE_URL = 'http://localhost:8000/api';
export const API_ENDPOINTS = {
  posts: `${API_BASE_URL}/posts/`,
  post: (id) => `${API_BASE_URL}/posts/${id}/`,
  token: `${API_BASE_URL}/token/`,
  refresh: `${API_BASE_URL}/token/refresh/`,
}; 