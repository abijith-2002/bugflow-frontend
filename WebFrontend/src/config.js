 // PUBLIC_INTERFACE
 /**
  * Returns the base URL for the backend API.
  * Reads from REACT_APP_API_BASE if provided; otherwise defaults to http://localhost:3001.
  * NOTE: Ensure REACT_APP_API_BASE is set in WebFrontend/.env to avoid pointing to the wrong backend.
  */
 export const API_BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

 // PUBLIC_INTERFACE
 /**
  * Build a full API URL using the configured base.
  * @param {string} path Relative path starting with a slash, e.g., "/login"
  * @returns {string} Full URL
  */
 export function apiUrl(path) {
   return `${API_BASE_URL}${path}`;
 }
