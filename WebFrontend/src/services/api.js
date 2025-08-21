import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// PUBLIC_INTERFACE
export const authApi = {
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Login response with token and user data
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response;
  },

  /**
   * Register new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} role - User role (user, admin, project_manager)
   * @returns {Promise} Registration response
   */
  register: async (email, password, role = 'user') => {
    const response = await api.post('/auth/register', { email, password, role });
    return response;
  },

  /**
   * Get current user information
   * @returns {Promise} Current user data
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response;
  },

  /**
   * Logout user
   * @returns {Promise} Logout response
   */
  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('token');
    return response;
  },
};

// PUBLIC_INTERFACE
export const projectsApi = {
  /**
   * Get all projects
   * @returns {Promise} List of projects
   */
  getProjects: async () => {
    const response = await api.get('/projects');
    return response;
  },

  /**
   * Get project by ID
   * @param {string} projectId - Project ID
   * @returns {Promise} Project data
   */
  getProject: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response;
  },

  /**
   * Create new project
   * @param {Object} projectData - Project data
   * @returns {Promise} Created project
   */
  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response;
  },

  /**
   * Update project
   * @param {string} projectId - Project ID
   * @param {Object} projectData - Updated project data
   * @returns {Promise} Updated project
   */
  updateProject: async (projectId, projectData) => {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response;
  },

  /**
   * Delete project
   * @param {string} projectId - Project ID
   * @returns {Promise} Deletion response
   */
  deleteProject: async (projectId) => {
    const response = await api.delete(`/projects/${projectId}`);
    return response;
  },
};

// PUBLIC_INTERFACE
export const bugsApi = {
  /**
   * Get all bugs with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise} List of bugs
   */
  getBugs: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/bugs?${params}`);
    return response;
  },

  /**
   * Get bug by ID
   * @param {string} bugId - Bug ID
   * @returns {Promise} Bug data
   */
  getBug: async (bugId) => {
    const response = await api.get(`/bugs/${bugId}`);
    return response;
  },

  /**
   * Create new bug
   * @param {Object} bugData - Bug data
   * @returns {Promise} Created bug
   */
  createBug: async (bugData) => {
    const response = await api.post('/bugs', bugData);
    return response;
  },

  /**
   * Update bug
   * @param {string} bugId - Bug ID
   * @param {Object} bugData - Updated bug data
   * @returns {Promise} Updated bug
   */
  updateBug: async (bugId, bugData) => {
    const response = await api.put(`/bugs/${bugId}`, bugData);
    return response;
  },

  /**
   * Delete bug
   * @param {string} bugId - Bug ID
   * @returns {Promise} Deletion response
   */
  deleteBug: async (bugId) => {
    const response = await api.delete(`/bugs/${bugId}`);
    return response;
  },

  /**
   * Get bugs by project
   * @param {string} projectId - Project ID
   * @returns {Promise} List of bugs for the project
   */
  getBugsByProject: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/bugs`);
    return response;
  },
};

// PUBLIC_INTERFACE
export const commentsApi = {
  /**
   * Get comments for a bug
   * @param {string} bugId - Bug ID
   * @returns {Promise} List of comments
   */
  getComments: async (bugId) => {
    const response = await api.get(`/bugs/${bugId}/comments`);
    return response;
  },

  /**
   * Add comment to bug
   * @param {string} bugId - Bug ID
   * @param {string} content - Comment content
   * @returns {Promise} Created comment
   */
  addComment: async (bugId, content) => {
    const response = await api.post(`/bugs/${bugId}/comments`, { content });
    return response;
  },

  /**
   * Update comment
   * @param {string} commentId - Comment ID
   * @param {string} content - Updated content
   * @returns {Promise} Updated comment
   */
  updateComment: async (commentId, content) => {
    const response = await api.put(`/comments/${commentId}`, { content });
    return response;
  },

  /**
   * Delete comment
   * @param {string} commentId - Comment ID
   * @returns {Promise} Deletion response
   */
  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response;
  },
};

// PUBLIC_INTERFACE
export const notificationsApi = {
  /**
   * Get user notifications
   * @returns {Promise} List of notifications
   */
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response;
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise} Update response
   */
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response;
  },

  /**
   * Mark all notifications as read
   * @returns {Promise} Update response
   */
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response;
  },
};

// PUBLIC_INTERFACE
export const dashboardApi = {
  /**
   * Get dashboard statistics
   * @returns {Promise} Dashboard data including metrics
   */
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response;
  },

  /**
   * Get recent activities
   * @returns {Promise} List of recent activities
   */
  getRecentActivities: async () => {
    const response = await api.get('/dashboard/activities');
    return response;
  },
};

export default api;
