export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

async function handleResponse(res) {
  if (!res.ok) {
    let msg = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      if (data && data.detail) msg = data.detail;
    } catch (_) {
      // ignore
    }
    throw new Error(msg);
  }
  return res.json();
}

// PUBLIC_INTERFACE
export async function fetchDisplayNameByUserId(userId) {
  /** Fetch display name from backend by user id. */
  if (!userId) {
    throw new Error("userId is required");
  }
  const res = await fetch(`${API_BASE_URL}/users/me`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId }),
  });
  return handleResponse(res);
}
