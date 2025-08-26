import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { login } from '../api';

// PUBLIC_INTERFACE
/**
 * LoginPage renders a Nord-themed login form and calls backend /login.
 * - Disables submit while processing
 * - Shows friendly success/error messages
 * - Persists tokens via api helper
 * - Accessibility: labels, focus management for first invalid field and alert focus
 */
export default function LoginPage() {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const alertRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    // autofocus email for accessibility
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    if (error && alertRef.current) {
      // move focus to alert on error for screen readers
      alertRef.current.focus();
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    // simple client-side check to focus the first empty field
    if (!email.trim()) {
      emailRef.current?.focus();
      return;
    }
    if (!password.trim()) {
      passwordRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const res = await login({ email, password });
      setInfo(res?.message || 'Signed in successfully.');
    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="nf-card" aria-label="Login form">
      <h1 className="nf-title">Welcome back</h1>
      <p className="nf-subtitle">Log in to your BugFlow account</p>

      {error && (
        <div
          className="nf-error"
          role="alert"
          tabIndex={-1}
          ref={alertRef}
          aria-live="assertive"
        >
          {error}
        </div>
      )}
      {info && (
        <div className="nf-success" role="status" aria-live="polite">
          {info}
        </div>
      )}

      <form className="nf-form" onSubmit={handleSubmit} noValidate>
        <div className="nf-field">
          <label className="nf-label" htmlFor="email">Email</label>
          <input
            id="email"
            className="nf-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            ref={emailRef}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            aria-required="true"
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
            ref={passwordRef}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            minLength={6}
            aria-required="true"
          />
        </div>

        <button className="nf-btn" type="submit" disabled={submitting} aria-disabled={submitting}>
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
