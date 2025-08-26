const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

// PUBLIC_INTERFACE
export async function signup(payload) {
  /**
   * Signup user via FastAPI backend.
   * payload: { email: string, password: string, full_name?: string }
   * Returns: JSON with success or error
   */
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.detail || data?.message || "Signup failed");
  }
  return data;
}

// PUBLIC_INTERFACE
export async function login(payload) {
  /**
   * Login user via FastAPI backend.
   * payload: { email: string, password: string }
   * Returns: JSON with tokens/session or sets cookie
   */
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.detail || data?.message || "Login failed");
  }
  return data;
}

// PUBLIC_INTERFACE
export async function me() {
  /**
   * Retrieve current authenticated user profile (if any).
   * Returns: JSON user info or throws if unauthorized
   */
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    credentials: "include",
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.detail || data?.message || "Not authenticated");
  }
  return data;
}

// PUBLIC_INTERFACE
export async function logout() {
  /**
   * Logs out the current user if backend supports it.
   */
  const res = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail || data?.message || "Logout failed");
  }
  return true;
}
