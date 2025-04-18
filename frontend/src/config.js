// API Configuration
const isDevelopment = import.meta.env.MODE === 'development';

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:8000/api'
  : 'https://your-backend-url.onrender.com/api'; // Replace with your actual backend URL after deployment

export const API_ENDPOINTS = {
  // Auth
  login: `${API_BASE_URL}/token/`,
  refresh: `${API_BASE_URL}/token/refresh/`,
  register: `${API_BASE_URL}/register/`,
  
  // Posts
  posts: `${API_BASE_URL}/posts/`,
  post: (id) => `${API_BASE_URL}/posts/${id}/`,
  myPosts: `${API_BASE_URL}/posts/my_posts/`,
  
  // Categories
  categories: `${API_BASE_URL}/categories/`,
  category: (id) => `${API_BASE_URL}/categories/${id}/`,
  
  // Tags
  tags: `${API_BASE_URL}/tags/`,
  tag: (id) => `${API_BASE_URL}/tags/${id}/`,
  
  // User
  userProfile: `${API_BASE_URL}/user/profile/`,
  user: (id) => `${API_BASE_URL}/user/${id}/`,
  changePassword: `${API_BASE_URL}/user/change-password/`,
}; 