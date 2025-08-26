import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { login } from '../api';

// PUBLIC_INTERFACE
/**
 * LoginPage renders a Nord-themed login form and calls backend /login.
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);
    try {
      const res = await login({ email, password });
      setInfo(res?.message || 'Login success');
      // Optionally store tokens; for now keep it simple:
      if (res?.access_token) {
        localStorage.setItem('access_token', res.access_token);
      }
      if (res?.refresh_token) {
        localStorage.setItem('refresh_token', res.refresh_token);
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="nf-card" aria-label="Login form">
      <h1 className="nf-title">Welcome back</h1>
      <p className="nf-subtitle">Log in to your BugFlow account</p>

      {error && <div className="nf-error" role="alert">{error}</div>}
      {info && <div className="nf-success">{info}</div>}

      <form className="nf-form" onSubmit={handleSubmit}>
        <div className="nf-field">
          <label className="nf-label" htmlFor="email">Email</label>
          <input
            id="email"
            className="nf-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="nf-field">
          <label className="nf-label" htmlFor="password">Password</label>
          <input
            id="password"
            className="nf-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            minLength={6}
          />
        </div>

        <button className="nf-btn" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="nf-row" style={{ marginTop: 12 }}>
        <span style={{ color: 'var(--text-muted)' }}>Don't have an account?</span>
        <Link className="nf-link" to="/signup">Create one</Link>
      </div>
    </section>
  );
}
