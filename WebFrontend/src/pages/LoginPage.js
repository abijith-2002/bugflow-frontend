import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiPost } from '../api';
import { saveAuth, isAuthenticated } from '../auth';

// PUBLIC_INTERFACE
export default function LoginPage() {
  /** Login screen with email/password posting to /auth/login. On success, persist token and redirect to dashboard. */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authed, setAuthed] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // If already authenticated, go straight to dashboard
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    // After successful authentication, immediately redirect to dashboard
    if (authed) {
      navigate('/dashboard', { replace: true });
    }
  }, [authed, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAuthed(null);
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    setLoading(true);
    try {
      const data = await apiPost('/auth/login', { email, password });
      // Expect at least access_token; optionally token_type, refresh_token, user_id
      const { access_token, token_type, user_id } = data || {};
      if (!access_token) {
        throw new Error('Invalid login response: missing access token');
      }
      // Save token (and a simple user object if provided)
      saveAuth({ access_token, token_type, user: user_id ? { id: user_id } : undefined });
      setAuthed({ ok: true });
    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Welcome back</h2>
      <p className="subtitle">Login with your credentials</p>

      {error ? <div className="error">{error}</div> : null}
      {authed ? (
        <div className="success" style={{ marginBottom: 12 }}>
          Login successful
        </div>
      ) : null}
      <form className="form" onSubmit={onSubmit}>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            minLength={8}
          />
        </div>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {/* Prompt directly below the button, centered */}
        <div className="centered-cta">
          <span className="subtitle">No account?</span>
          <Link className="link" to="/signup">Create one</Link>
        </div>
      </form>
    </div>
  );
}
