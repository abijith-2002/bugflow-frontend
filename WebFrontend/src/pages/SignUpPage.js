import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiPost } from '../api';

// PUBLIC_INTERFACE
export default function SignUpPage() {
  /** Sign-up screen posting to /auth/signup. On success, shows success message then redirects to login. */
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(''); // display name
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // After success message is shown, redirect to login shortly after.
    if (result && result._success) {
      const timer = setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1200); // brief delay so user sees the success message
      return () => clearTimeout(timer);
    }
  }, [result, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    // Basic validation for presence and minimal username length
    if (!email || !password || !username) {
      setError('Please provide email, username and password.');
      return;
    }
    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters.');
      return;
    }

    setLoading(true);
    try {
      const payload = { email, password, username };
      await apiPost('/auth/signup', payload);
      // Regardless of backend message/fields, enforce the new UX requirements:
      setResult({ _success: true, message: 'User registered successfully' });
    } catch (err) {
      setError(err?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Create your account</h2>
      <p className="subtitle">Use your email, a display name, and a strong password</p>

      {error ? <div className="error">{error}</div> : null}
      {result && result._success ? (
        <div className="success" style={{ marginBottom: 12 }}>
          {result.message}
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
          <label className="label" htmlFor="username">Username (display name)</label>
          <input
            id="username"
            className="input"
            type="text"
            placeholder="Your display name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="nickname"
            required
            minLength={2}
            maxLength={60}
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
