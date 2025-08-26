 // PUBLIC_INTERFACE
 /**
  * Runtime-configurable API base URL with localStorage persistence.
  * - Reads initial value from localStorage 'api_base_url' or REACT_APP_API_BASE or default.
  * - Exposes getters/setters and a subscribe mechanism for components to react to changes.
  * - All API helpers should call apiUrl(path) at call time to use the latest base.
  *
  * Env note: Request the user to provide REACT_APP_API_BASE in .env. If not set, defaults to http://localhost:3001.
  */
 const DEFAULT_API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

 const STORAGE_KEY = 'api_base_url';

 let currentBase = null;
 try {
   const saved = localStorage.getItem(STORAGE_KEY);
   currentBase = saved && typeof saved === 'string' ? saved : null;
 } catch {
   currentBase = null;
 }

 let API_BASE_URL = (currentBase || DEFAULT_API_BASE).replace(/\/+$/, ''); // trim trailing slash

 // Simple pub/sub for URL changes
 const listeners = new Set();

 // PUBLIC_INTERFACE
 /**
  * Get the current API base URL.
  * @returns {string}
  */
 export function getApiBase() {
   return API_BASE_URL;
 }

 // PUBLIC_INTERFACE
 /**
  * Set a new API base URL. Persists to localStorage and notifies subscribers.
  * @param {string} url
  */
 export function setApiBase(url) {
   if (!url || typeof url !== 'string') return;
   const normalized = url.replace(/\/+$/, '');
   API_BASE_URL = normalized;
   try {
     localStorage.setItem(STORAGE_KEY, normalized);
   } catch {
     // no-op if storage unavailable
   }
   listeners.forEach((cb) => {
     try { cb(API_BASE_URL); } catch { /* ignore subscriber errors */ }
   });
 }

 // PUBLIC_INTERFACE
 /**
  * Subscribe to API base URL changes.
  * @param {(url:string)=>void} callback
  * @returns {() => void} unsubscribe
  */
 export function subscribeApiBase(callback) {
   listeners.add(callback);
   return () => listeners.delete(callback);
 }

 // PUBLIC_INTERFACE
 /**
  * Build a full API URL using the configured base.
  * @param {string} path Relative path starting with a slash, e.g., "/login"
  * @returns {string} Full URL
  */
 export function apiUrl(path) {
   const base = getApiBase();
   return `${base}${path}`;
 }
