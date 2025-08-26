import React, { useState } from "react";
import { login } from "../services/api";

// PUBLIC_INTERFACE
export function Login({ onSuccess, onSwitchToSignup, onError }) {
  /**
   * Login form with email/password validation and API call.
   */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localErr, setLocalErr] = useState("");

  const validate = () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setLocalErr("Please enter a valid email address.");
      return false;
    }
    if (!password || password.length < 6) {
      setLocalErr("Password must be at least 6 characters.");
      return false;
    }
    setLocalErr("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onError?.("");
    if (!validate()) return;
    setLoading(true);
    try {
      await login({ email, password });
      onSuccess?.();
    } catch (err) {
      const message = err?.message || "Login failed";
      setLocalErr(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card">
        <h1 className="title">Sign in</h1>
        <p className="muted">Access your BugFlow account</p>
        {localErr ? <div className="alert">{localErr}</div> : null}
        <form onSubmit={handleSubmit} className="form">
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <label className="label" htmlFor="password">Password</label>
          <div className="password-field">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              minLength={6}
            />
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? <span className="spinner inline" /> : null}
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="hint">
          No account?{" "}
          <button className="link" type="button" onClick={onSwitchToSignup}>
            Create one
          </button>
        </div>
      </div>
    </div>
  );
}
