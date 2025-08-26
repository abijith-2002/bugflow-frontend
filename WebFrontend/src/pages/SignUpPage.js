import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiPost } from '../api';

// PUBLIC_INTERFACE
export default function SignUpPage() {
  /** Sign-up screen posting to /auth/signup. Shows verification hints. */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    setLoading(true);
    try {
      const payload = { email, password };
      const data = await apiPost('/auth/signup', payload);
      setResult(data || { message: 'Registered. Check your email for confirmation.', needs_verification: true });
    } catch (err) {
      setError(err?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Create your account</h2>
      <p className="subtitle">Use your email and a strong password</p>

      {error ? <div className="error">{error}</div> : null}
      {result ? (
        <div className="success" style={{ marginBottom: 12 }}>
          {result.message || 'Registration completed.'}
          {result.needs_verification ? ' Please check your email to verify your account.' : ''}
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
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign up'}
        </button>

        {/* Prompt directly below the button, centered */}
        <div className="centered-cta">
          <span className="subtitle">Already have an account?</span>
          <Link className="link" to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
}
