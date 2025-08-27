import { getApiBaseUrl } from './apiConfig';

// PUBLIC_INTERFACE
export async function apiPost(path, body) {
  /** Sends a JSON POST request to the backend and returns parsed JSON or throws an error with message. */
  const base = getApiBaseUrl();
  const resp = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    const message =
      (data && (data.detail || data.message || data.error)) ||
      `Request failed with status ${resp.status}`;
    const error = new Error(message);
    error.status = resp.status;
    error.data = data;
    throw error;
  }
  return data;
}

// PUBLIC_INTERFACE
export async function apiGet(path, params) {
  /** 
   * Sends a GET request with optional query parameters.
   * Ensures proper URL encoding and excludes null/undefined params to avoid backend parsing errors.
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

  const resp = await fetch(url.toString(), { method: 'GET' });
  const text = await resp.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // ignore parse errors, will handle below
  }

  if (!resp.ok) {
    const message =
      (data && (data.detail || data.message || data.error)) ||
      `Request failed with status ${resp.status}`;
    const error = new Error(message);
    error.status = resp.status;
    error.data = data;
    throw error;
  }
  return data;
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
  /** Create a new work item (task or bug). Follows backend OpenAPI: POST /work-items. */
  if (!project_id || !item_type || !title) {
    throw new Error('project_id, item_type and title are required');
  }
  const payload = {
    project_id,
    item_type,
    title,
    description: description ?? null,
    status: status ?? null,
    priority: priority ?? null,
    created_at: created_at ?? new Date().toISOString(),
  };
  return apiPost('/work-items', payload);
}

// PUBLIC_INTERFACE
export function buildUrl(path) {
  /** Returns the full URL for the given API path using the current base. */
  const base = getApiBaseUrl();
  return `${base}${path}`;
}
