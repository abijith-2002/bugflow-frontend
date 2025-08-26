import { apiUrl } from './config';

// PUBLIC_INTERFACE
/**
 * Perform user login against backend /login.
 * @param {{email: string, password: string}} payload
 * @returns {Promise<{user_id?: string, access_token?: string, refresh_token?: string, message: string}>}
 */
export async function login(payload) {
  const res = await fetch(apiUrl('/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || 'Login failed';
    throw new Error(message);
  }
  return data;
}

// PUBLIC_INTERFACE
/**
 * Perform user signup against backend /signup.
 * @param {{email: string, password: string, full_name?: string}} payload
 * @returns {Promise<{user_id?: string, access_token?: string, refresh_token?: string, message: string}>}
 */
export async function signup(payload) {
  const res = await fetch(apiUrl('/signup'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || 'Signup failed';
    throw new Error(message);
  }
  return data;
}
