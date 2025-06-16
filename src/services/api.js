import axios from "axios";

// Create an axios instance with default config
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Log the baseURL for debugging
console.log("API baseURL:", api.defaults.baseURL);

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Template API calls
export const templateApi = {
  // Get all templates
  getAll: () => api.get("/templates"),

  // Get templates with pagination and filtering
  discover: (page = 1, limit = 10, filters = {}) => {
    const { category, tags } = filters;
    let url = `/templates/discover?page=${page}&limit=${limit}`;
    if (category) url += `&category=${category}`;
    if (tags) url += `&tags=${tags}`;
    return api.get(url);
  },

  // Get a single template
  getById: (id) => api.get(`/templates/${id}`),

  // Create a new template
  create: (templateData) => api.post("/templates", templateData),

  // Update a template
  update: (id, templateData) => api.patch(`/templates/${id}`, templateData),

  // Delete a template
  delete: (id) => api.delete(`/templates/${id}`),
};

// User API calls
export const userApi = {
  // Register a new user
  register: (userData) => api.post("/users/register", userData),

  // Login user
  login: (credentials) => api.post("/users/login", credentials),

  // Get user profile
  getProfile: (id) => api.get(`/users/${id}`),

  // Update user profile
  updateProfile: (id, userData) => api.patch(`/users/${id}`, userData),

  // Get user's favorite templates
  getFavorites: (id) => api.get(`/users/${id}/favorites`),

  // Add template to favorites
  addToFavorites: (userId, templateId) =>
    api.post(`/users/${userId}/favorites/${templateId}`),

  // Remove template from favorites
  removeFromFavorites: (userId, templateId) =>
    api.delete(`/users/${userId}/favorites/${templateId}`),
};

// Interaction API calls
export const interactionApi = {
  // Record a new interaction (like, dislike, favorite, view)
  create: (interactionData) => api.post("/interactions", interactionData),

  // Get all interactions for a specific user
  getByUser: (userId) => api.get(`/interactions/user/${userId}`),

  // Get all interactions for a specific template
  getByTemplate: (templateId) =>
    api.get(`/interactions/template/${templateId}`),

  // Get interaction stats for a template
  getTemplateStats: (templateId) =>
    api.get(`/interactions/stats/template/${templateId}`),

  // Delete an interaction
  delete: (id) => api.delete(`/interactions/${id}`),

  // Helper methods for common interactions
  likeTemplate: (userId, templateId) => {
    return api.post("/interactions", { userId, templateId, interactionType: "like" })
    .then(response => {
      return response;
    })
    .catch(err => {
      // If the interaction already exists, we can consider this a success
      if (err.response?.data?.message === "Interaction already exists") {
        console.log('Like interaction already exists, treating as success');
        return { data: { message: "Interaction already exists" } };
      }
      // Otherwise, rethrow the error
      throw err;
    });
  },

  dislikeTemplate: (userId, templateId) => {
    return api.post("/interactions", {
      userId,
      templateId,
      interactionType: "dislike",
    })
    .then(response => {
      return response;
    })
    .catch(err => {
      // If the interaction already exists, we can consider this a success
      if (err.response?.data?.message === "Interaction already exists") {
        console.log('Dislike interaction already exists, treating as success');
        return { data: { message: "Interaction already exists" } };
      }
      // Otherwise, rethrow the error
      throw err;
    });
  },

  favoriteTemplate: (userId, templateId) => {
    return api.post("/interactions", {
      userId,
      templateId,
      interactionType: "favorite",
    })
    .then(response => {
      return response;
    })
    .catch(err => {
      // If the interaction already exists, we can consider this a success
      if (err.response?.data?.message === "Interaction already exists") {
        console.log('Interaction already exists, treating as success');
        return { data: { message: "Interaction already exists" } };
      }
      // Otherwise, rethrow the error
      throw err;
    });
  },

  viewTemplate: (userId, templateId) => {
    return api.post("/interactions", { userId, templateId, interactionType: "view" })
    .then(response => {
      return response;
    })
    .catch(err => {
      // If the interaction already exists, we can consider this a success
      if (err.response?.data?.message === "Interaction already exists") {
        console.log('View interaction already exists, treating as success');
        return { data: { message: "Interaction already exists" } };
      }
      // Otherwise, rethrow the error
      throw err;
    });
  },
};

export default {
  template: templateApi,
  user: userApi,
  interaction: interactionApi,
};
