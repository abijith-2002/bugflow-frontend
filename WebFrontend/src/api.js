import { getApiBaseUrl } from './apiConfig';
import { getAuthHeaderValue, clearAuth } from './auth';

/**
 * Decide whether a path is public (no Authorization header) or protected.
 * Public endpoints include authentication endpoints like /auth/login and /auth/signup.
 */
function isPublicPath(path) {
  const p = String(path || '').toLowerCase();
  // Only auth endpoints are public; all others, including /projects, are protected.
  return p.startsWith('/auth/login') || p.startsWith('/auth/signup');
}

// INTERNAL: build headers, conditionally add Authorization for protected paths
function buildHeaders(path, extra = {}) {
  const headers = { ...(extra || {}) };
  if (!isPublicPath(path)) {
    const auth = getAuthHeaderValue();
    if (auth) headers['Authorization'] = auth;
  }
  return headers;
}

/**
 * INTERNAL: Handles non-OK responses. If response is 401 and not a public path,
 * clears auth and redirects to /login. Throws an Error for upstream handling.
 */
function handleErrorResponse(resp, data, path) {
  const message =
    (data && (data.detail || data.message || data.error)) ||
    `Request failed with status ${resp.status}`;
  const error = new Error(message);
  error.status = resp.status;
  error.data = data;

  // Auto-logout on 401 for protected routes
  if (resp.status === 401 && !isPublicPath(path)) {
    try {
      clearAuth();
    } finally {
      // Use replace navigation so back button doesn't return to a broken state
      if (typeof window !== 'undefined' && window.location) {
        window.location.replace('/login');
      }
    }
  }
  throw error;
}

// PUBLIC_INTERFACE
export async function apiDelete(path) {
  /** Sends a DELETE request to the backend and returns parsed JSON (if any) or null. Throws on non-2xx.
   * Automatically attaches Authorization header for protected endpoints.
   */
  const base = getApiBaseUrl();
  const resp = await fetch(`${base}${path}`, { method: 'DELETE', headers: buildHeaders(path) });
  const text = await resp.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // ignore parse errors
  }
  if (!resp.ok) {
    return handleErrorResponse(resp, data, path);
  }
  return data;
}

// PUBLIC_INTERFACE
export async function apiPost(path, body) {
  /** Sends a JSON POST request to the backend and returns parsed JSON or throws an error with message.
   * Automatically attaches Authorization header for protected endpoints (not for /auth/login or /auth/signup).
   */
  const base = getApiBaseUrl();
  const resp = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: buildHeaders(path, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(body ?? {}),
  });

  const text = await resp.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // ignore parse errors, will handle below
  }

  if (!resp.ok) {
    return handleErrorResponse(resp, data, path);
  }
  return data;
}

// PUBLIC_INTERFACE
export async function apiGet(path, params) {
  /** 
   * Sends a GET request with optional query parameters.
   * Ensures proper URL encoding and excludes null/undefined params to avoid backend parsing errors.
   * Automatically attaches Authorization header for protected endpoints.
   */
  const base = getApiBaseUrl();
  const url = new URL(`${base}${path}`);
  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const resp = await fetch(url.toString(), { method: 'GET', headers: buildHeaders(path) });
  const text = await resp.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // ignore parse errors, will handle below
  }

  if (!resp.ok) {
    return handleErrorResponse(resp, data, path);
  }
  return data;
}

// PUBLIC_INTERFACE
export async function apiPatch(path, body) {
  /** Sends a JSON PATCH request to the backend and returns parsed JSON or throws an error.
   * Automatically attaches Authorization header for protected endpoints.
   */
  const base = getApiBaseUrl();
  const resp = await fetch(`${base}${path}`, {
    method: 'PATCH',
    headers: buildHeaders(path, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(body ?? {}),
  });

  const text = await resp.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // ignore parse errors
  }

  if (!resp.ok) {
    return handleErrorResponse(resp, data, path);
  }
  return data;
}

/**
 * PUBLIC_INTERFACE
 */
export async function getWorkItemComments({ project_id, id }) {
  /** Fetch comments for a specific work item. GET /work-items/{project_id}/{id}/comments */
  if (!project_id || (!id && id !== 0)) {
    throw new Error('project_id and id are required');
  }
  return apiGet(`/work-items/${project_id}/${id}/comments`);
}

/**
 * PUBLIC_INTERFACE
 */
export async function addWorkItemComment({ project_id, id, body, author_id = null, author_display_name = null }) {
  /** Add a new comment to a work item. POST /work-items/{project_id}/{id}/comments
   * Ensures author_id is sourced from localStorage (bugflow.auth.user.id) for all requests.
   * author_display_name can still be passed to improve immediate UI attribution.
   */
  if (!project_id || (!id && id !== 0)) {
    throw new Error('project_id and id are required');
  }
  if (!body || !String(body).trim()) {
    throw new Error('Comment body is required');
  }

  // Read bugflow.auth.user from localStorage safely and extract id
  let storedAuthorId = null;
  try {
    const raw = localStorage.getItem('bugflow.auth.user');
    if (raw) {
      const parsed = JSON.parse(raw);
      const idVal = parsed && parsed.id !== undefined ? parsed.id : null;
      if (idVal !== undefined && idVal !== null && String(idVal).trim() !== '') {
        storedAuthorId = idVal;
      }
    }
  } catch {
    // ignore storage/parse errors; fallback to null below
  }

  // If an explicit author_id argument is provided, prefer it; otherwise use storedAuthorId; fallback to null
  const effectiveAuthorId = (author_id !== undefined && author_id !== null && String(author_id).trim() !== '')
    ? author_id
    : (storedAuthorId !== undefined ? storedAuthorId : null);

  const payload = { body: String(body).trim() };
  // Always include author_id with safe fallback (null when missing)
  payload.author_id = effectiveAuthorId ?? null;

  // Include author_display_name only if provided (optional UI hint)
  if (author_display_name !== undefined && author_display_name !== null) {
    payload.author_display_name = author_display_name;
  }

  return apiPost(`/work-items/${project_id}/${id}/comments`, payload);
}

// PUBLIC_INTERFACE
export async function getWorkItems({ projectId } = {}) {
  /** 
   * Fetch work items from backend, optionally filtered by project_id.
   * Matches backend spec: GET /work-items?project_id=<uuid>
   */
  const params = {};
  if (projectId) params.project_id = projectId;
  return apiGet('/work-items', params);
}

/**
 * PUBLIC_INTERFACE
 */
export async function createWorkItem({ project_id, item_type, title, description, status, priority, created_at }) {
  /** Create a new work item (task or bug). Follows backend OpenAPI: POST /work-items.
   * Adds created_by using current user's displayName from localStorage (bugflow.auth.user.displayName).
   */
  if (!project_id || !item_type || !title) {
    throw new Error('project_id, item_type and title are required');
  }

  // Safely read displayName from localStorage via auth helper
  let createdBy = null;
  try {
    const { getDisplayName } = await import('./auth');
    const name = typeof getDisplayName === 'function' ? getDisplayName() : null;
    if (name && String(name).trim()) createdBy = String(name).trim();
  } catch {
    // ignore lookup errors
  }

  const payload = {
    project_id,
    item_type,
    title,
    description: description ?? null,
    status: status ?? null,
    priority: priority ?? null,
    created_by: createdBy ?? null, // backend maps this to `creator` column
    created_at: created_at ?? new Date().toISOString(),
  };
  return apiPost('/work-items', payload);
}

// PUBLIC_INTERFACE
export async function updateWorkItemStatus({ project_id, id, status }) {
  /** Calls PATCH /work-items/{project_id}/{id}/status to update a work item's status. */
  if (!project_id || (!id && id !== 0)) throw new Error('project_id and id are required');
  if (!status) throw new Error('status is required');
  return apiPatch(`/work-items/${project_id}/${id}/status`, { status });
}

// PUBLIC_INTERFACE
export function buildUrl(path) {
  /** Returns the full URL for the given API path using the current base. */
  const base = getApiBaseUrl();
  return `${base}${path}`;
}
