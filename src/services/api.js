import axios from 'axios';

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
    const {
      searchQuery,
      categories,
      frameworkTools,
      pricingTiers,
      colorSchemes,
      responsive,
      accessibilityLevels,
      languageSupport,
      sortBy
    } = filters;
    
    let url = `/templates/discover?page=${page}&limit=${limit}`;
    
    // Add search query
    if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
    
    // Add array filters
    if (categories && categories.length > 0) {
      url += `&category=${categories.join(',')}`;
    }
    if (frameworkTools && frameworkTools.length > 0) {
      url += `&frameworkTools=${frameworkTools.join(',')}`;
    }
    if (pricingTiers && pricingTiers.length > 0) {
      url += `&pricingTier=${pricingTiers.join(',')}`;
    }
    if (colorSchemes && colorSchemes.length > 0) {
      url += `&colorScheme=${colorSchemes.join(',')}`;
    }
    if (accessibilityLevels && accessibilityLevels.length > 0) {
      url += `&accessibilityLevel=${accessibilityLevels.join(',')}`;
    }
    if (languageSupport && languageSupport.length > 0) {
      url += `&languageSupport=${languageSupport.join(',')}`;
    }
    
    // Add boolean filters
    if (responsive !== null && responsive !== undefined) {
      url += `&responsive=${responsive}`;
    }
    
    // Add sort parameter
    if (sortBy) {
      url += `&sort=${sortBy}`;
    }
    
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

  // Get trending templates
  getTrending: (type) => api.get(`/templates/trending/${type}`),
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
  getFavorites: (userId) => {
    // Ensure userId is a string and properly formatted
    let userIdStr;
    if (userId && typeof userId === 'object' && userId._id) {
      // If userId is an object with _id property, use that
      userIdStr = userId._id.toString();
    } else {
      // Otherwise use the userId directly
      userIdStr = userId.toString();
    }
    
    console.log('Getting favorites - using userId:', userIdStr, 'type:', typeof userIdStr);
    
    return api.get(`/users/${userIdStr}/favorites`);
  },

  // Add template to favorites
  addToFavorites: (userId, templateId) => {
    // Ensure userId is a string and properly formatted
    let userIdStr;
    if (userId && typeof userId === 'object' && userId._id) {
      // If userId is an object with _id property, use that
      userIdStr = userId._id.toString();
    } else {
      // Otherwise use the userId directly
      userIdStr = userId.toString();
    }
    
    console.log('Adding to favorites - using userId:', userIdStr, 'type:', typeof userIdStr);
    
    return api.post(`/users/${userIdStr}/favorites/${templateId}`);
  },

  // Remove template from favorites
  removeFromFavorites: (userId, templateId) => {
    // Ensure userId is a string and properly formatted
    let userIdStr;
    if (userId && typeof userId === 'object' && userId._id) {
      // If userId is an object with _id property, use that
      userIdStr = userId._id.toString();
    } else {
      // Otherwise use the userId directly
      userIdStr = userId.toString();
    }
    
    console.log('Removing from favorites - using userId:', userIdStr, 'type:', typeof userIdStr);
    
    return api.delete(`/users/${userIdStr}/favorites/${templateId}`);
  },

  // Get user's uploaded templates
  getUserTemplates: (userId) => {
    // Ensure userId is a string and properly formatted
    let userIdStr;
    if (userId && typeof userId === 'object' && userId._id) {
      // If userId is an object with _id property, use that
      userIdStr = userId._id.toString();
    } else {
      // Otherwise use the userId directly
      userIdStr = userId.toString();
    }
    
    console.log('Getting user templates - using userId:', userIdStr, 'type:', typeof userIdStr);
    
    return api.get(`/users/${userIdStr}/templates`);
  },
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
    // Ensure userId is a string and properly formatted
    let userIdStr;
    if (userId && typeof userId === 'object' && userId._id) {
      // If userId is an object with _id property, use that
      userIdStr = userId._id.toString();
    } else {
      // Otherwise use the userId directly
      userIdStr = userId.toString();
    }
    
    console.log('Like template - using userId:', userIdStr, 'type:', typeof userIdStr);
    
    return api.post("/interactions", { 
      userId: userIdStr, 
      templateId, 
      interactionType: "like",
      // Include additional user info to help server identify the user
      username: userId && typeof userId === 'object' ? userId.username : undefined,
      email: userId && typeof userId === 'object' ? userId.email : undefined
    })
    .then(response => {
      return response;
    })
    .catch(err => {
      console.log('Like error response:', err.response?.data);
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
    // Ensure userId is a string and properly formatted
    let userIdStr;
    if (userId && typeof userId === 'object' && userId._id) {
      // If userId is an object with _id property, use that
      userIdStr = userId._id.toString();
    } else {
      // Otherwise use the userId directly
      userIdStr = userId.toString();
    }
    
    console.log('Dislike template - using userId:', userIdStr, 'type:', typeof userIdStr);
    
    return api.post("/interactions", { 
      userId: userIdStr, 
      templateId, 
      interactionType: "dislike",
      // Include additional user info to help server identify the user
      username: userId && typeof userId === 'object' ? userId.username : undefined,
      email: userId && typeof userId === 'object' ? userId.email : undefined
    })
    .then(response => {
      return response;
    })
    .catch(err => {
      console.log('Dislike error response:', err.response?.data);
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
    // Ensure userId is a string and properly formatted
    let userIdStr;
    if (userId && typeof userId === 'object' && userId._id) {
      // If userId is an object with _id property, use that
      userIdStr = userId._id.toString();
    } else {
      // Otherwise use the userId directly
      userIdStr = userId.toString();
    }
    
    console.log('Favorite template - using userId:', userIdStr, 'type:', typeof userIdStr);
    
    return api.post("/interactions", { 
      userId: userIdStr, 
      templateId, 
      interactionType: "favorite",
      // Include additional user info to help server identify the user
      username: userId && typeof userId === 'object' ? userId.username : undefined,
      email: userId && typeof userId === 'object' ? userId.email : undefined
    })
    .then(response => {
      return response;
    })
    .catch(err => {
      console.log('Favorite error response:', err.response?.data);
      // If the interaction already exists, we can consider this a success
      if (err.response?.data?.message === "Interaction already exists") {
        console.log('Favorite interaction already exists, treating as success');
        return { data: { message: "Interaction already exists" } };
      }
      // Otherwise, rethrow the error
      throw err;
    });
  },
  
  viewTemplate: (userId, templateId) => {
    // Ensure userId is a string and properly formatted
    let userIdStr;
    if (userId && typeof userId === 'object' && userId._id) {
      // If userId is an object with _id property, use that
      userIdStr = userId._id.toString();
    } else {
      // Otherwise use the userId directly
      userIdStr = userId.toString();
    }
    
    console.log('View template - using userId:', userIdStr, 'type:', typeof userIdStr);
    console.log('View template - templateId:', templateId, 'type:', typeof templateId);
    
    return api.post("/interactions", { 
      userId: userIdStr, 
      templateId, 
      interactionType: "view",
      // Include additional user info to help server identify the user
      username: userId && typeof userId === 'object' ? userId.username : undefined,
      email: userId && typeof userId === 'object' ? userId.email : undefined
    })
    .then(response => {
      console.log('View interaction recorded successfully');
      return response;
    })
    .catch(err => {
      console.log('View error response:', err.response?.data);
      console.log('View error status:', err.response?.status);
      
      // If the interaction already exists, we can consider this a success
      if (err.response?.data?.message === "Interaction already exists") {
        console.log('View interaction already exists, treating as success');
        return { data: { message: "Interaction already exists" } };
      }
      
      // If it's a 400 error with user/template not found, log but don't throw
      if (err.response?.status === 400) {
        console.log('View interaction failed with 400 error, but continuing:', err.response.data.message);
        return { data: { message: "View interaction failed but continuing" } };
      }
      
      // Otherwise, rethrow the error
      throw err;
    });
  },

  // Get user interactions by type
  getUserInteractions: (userId, interactionType) => {
    // Ensure userId is a string and properly formatted
    let userIdStr;
    if (userId && typeof userId === 'object' && userId._id) {
      userIdStr = userId._id.toString();
    } else {
      userIdStr = userId.toString();
    }
    
    console.log('Getting user interactions - userId:', userIdStr, 'type:', interactionType);
    
    const params = interactionType ? { interactionType } : {};
    return api.get(`/interactions/user/${userIdStr}`, { params });
  },

  // Get notifications for a user (interactions on their templates)
  getNotifications: (userId) => {
    // Ensure userId is a string and properly formatted
    let userIdStr;
    if (userId && typeof userId === 'object' && userId._id) {
      userIdStr = userId._id.toString();
    } else {
      userIdStr = userId.toString();
    }
    
    console.log('Getting notifications - userId:', userIdStr);
    
    return api.get(`/interactions/notifications/${userIdStr}`);
  },

  // Record download interaction
  downloadTemplate: (userId, templateId) => {
    // Ensure userId is a string and properly formatted
    let userIdStr;
    if (userId && typeof userId === 'object' && userId._id) {
      userIdStr = userId._id.toString();
    } else {
      userIdStr = userId.toString();
    }
    
    console.log('Download template - using userId:', userIdStr, 'type:', typeof userIdStr);
    
    return api.post("/interactions", { 
      userId: userIdStr, 
      templateId, 
      interactionType: "download",
      username: userId && typeof userId === 'object' ? userId.username : undefined,
      email: userId && typeof userId === 'object' ? userId.email : undefined
    })
    .then(response => {
      console.log('Download interaction recorded successfully');
      return response;
    })
    .catch(err => {
      console.log('Download error response:', err.response?.data);
      // Downloads can be recorded multiple times, so don't treat duplicates as errors
      if (err.response?.data?.message === "Interaction already exists") {
        console.log('Download interaction already exists, treating as success');
        return { data: { message: "Interaction already exists" } };
      }
      throw err;
    });
  },
};

// Review API calls
export const reviewApi = {
  // Get reviews for a user
  getByUser: (userId) => api.get(`/reviews/user/${userId}`),
  
  // Create a new review
  create: (reviewData) => api.post('/reviews', reviewData),
  
  // Update a review
  update: (reviewId, reviewData) => api.put(`/reviews/${reviewId}`, reviewData),
  
  // Delete a review
  delete: (reviewId) => api.delete(`/reviews/${reviewId}`)
};

export default {
  template: templateApi,
  user: userApi,
  interaction: interactionApi,
  review: reviewApi,
};
