import axios from 'axios';
import { supabase } from '../supabaseClient';

const apiBaseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 15000,
});

// Inject Supabase JWT if available
api.interceptors.request.use(async (config) => {
  try {
    const { data } = await supabase.auth.getSession();
    const accessToken = data?.session?.access_token;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  } catch {
    // No session available; proceed without token
  }
  return config;
});

/**
 * PUBLIC_INTERFACE
 * Executes a GET request to the backend API.
 * @param {string} path - API path (e.g., '/projects')
 * @param {object} [params] - Query params
 * @returns {Promise<any>} Response data
 */
export async function apiGet(path, params) {
  /** Performs a GET request against the configured backend API. */
  const res = await api.get(path, { params });
  return res.data;
}

/**
 * PUBLIC_INTERFACE
 * Executes a POST request to the backend API.
 * @param {string} path - API path
 * @param {object} body - JSON body
 * @returns {Promise<any>} Response data
 */
export async function apiPost(path, body) {
  /** Performs a POST request against the configured backend API. */
  const res = await api.post(path, body);
  return res.data;
}

/**
 * PUBLIC_INTERFACE
 * Executes a PUT request to the backend API.
 * @param {string} path - API path
 * @param {object} body - JSON body
 * @returns {Promise<any>} Response data
 */
export async function apiPut(path, body) {
  /** Performs a PUT request against the configured backend API. */
  const res = await api.put(path, body);
  return res.data;
}

/**
 * PUBLIC_INTERFACE
 * Executes a DELETE request to the backend API.
 * @param {string} path - API path
 * @returns {Promise<any>} Response data
 */
export async function apiDelete(path) {
  /** Performs a DELETE request against the configured backend API. */
  const res = await api.delete(path);
  return res.data;
}

// Convenience domain-specific wrappers (safe if backend not yet implemented)
export const Api = {
  // PUBLIC_INTERFACE
  /** Fetch dashboard overview. */
  fetchDashboard: () => apiGet('/dashboard').catch(() => ({ projects: 0, open_bugs: 0, my_bugs: 0 })),

  // PUBLIC_INTERFACE
  /** Project management */
  listProjects: () => apiGet('/projects').catch(() => ([])),
  createProject: (payload) => apiPost('/projects', payload).catch(() => ({ ...payload, id: 'temp-id' })),

  // PUBLIC_INTERFACE
  /** Bug management */
  listBugs: (params) => apiGet('/bugs', params).catch(() => ([])),
  getBug: (id) => apiGet(`/bugs/${id}`).catch(() => (null)),
  createBug: (payload) => apiPost('/bugs', payload).catch(() => ({ ...payload, id: 'temp-id' })),

  // PUBLIC_INTERFACE
  /** Notifications */
  listNotifications: () => apiGet('/notifications').catch(() => ([])),
  markNotificationRead: (id) => apiPost(`/notifications/${id}/read`, {}).catch(() => ({ success: true })),
};
