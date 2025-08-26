import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { signup } from '../api';

// PUBLIC_INTERFACE
/**
 * SignupPage renders a Nord-themed signup form and calls backend /signup.
 */
export default function SignupPage() {
  const [fullName, setFullName] = useState('');
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
      const res = await signup({ email, password, full_name: fullName || undefined });
      setInfo(res?.message || 'Signup success. Please check your email if confirmation is required.');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="nf-card" aria-label="Signup form">
      <h1 className="nf-title">Create your account</h1>
      <p className="nf-subtitle">Join BugFlow to track and squash bugs</p>

      {error && <div className="nf-error" role="alert">{error}</div>}
      {info && <div className="nf-success">{info}</div>}

      <form className="nf-form" onSubmit={handleSubmit}>
        <div className="nf-field">
          <label className="nf-label" htmlFor="full_name">Full name (optional)</label>
          <input
            id="full_name"
            className="nf-input"
            type="text"
            placeholder="Ada Lovelace"
            value={fullName}
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
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
          />
        </div>

        <button className="nf-btn" type="submit" disabled={submitting}>
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
