import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { signup } from '../api';

// PUBLIC_INTERFACE
/**
 * SignupPage renders a Nord-themed signup form and calls backend /signup.
 * - Disables submit while processing
 * - Shows friendly success/error messages
 * - Persists tokens via api helper if backend returns them
 * - Accessibility: labels, focus management for first invalid field and alert focus
 */
export default function SignupPage() {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const alertRef = useRef(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    // autofocus first field
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    if (error && alertRef.current) {
      alertRef.current.focus();
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    // simple client-side checks to focus first empty required field
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
      const res = await signup({ email, password, full_name: fullName || undefined });
      setInfo(res?.message || 'Account created successfully.');
    } catch (err) {
      setError(err?.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="nf-card" aria-label="Signup form">
      <h1 className="nf-title">Create your account</h1>
      <p className="nf-subtitle">Join BugFlow to track and squash bugs</p>

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
          <label className="nf-label" htmlFor="full_name">Full name (optional)</label>
          <input
            id="full_name"
            className="nf-input"
            type="text"
            placeholder="Ada Lovelace"
            value={fullName}
            ref={nameRef}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
          />
        </div>

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
            placeholder="At least 6 characters"
            value={password}
            ref={passwordRef}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
            aria-required="true"
          />
        </div>

        <button className="nf-btn" type="submit" disabled={submitting} aria-disabled={submitting}>
          {submitting ? 'Creating…' : 'Create account'}
        </button>
      </form>

      <div className="nf-row" style={{ marginTop: 12 }}>
        <span style={{ color: 'var(--text-muted)' }}>Already have an account?</span>
        <Link className="nf-link" to="/login">Sign in</Link>
      </div>
    </section>
  );
}
