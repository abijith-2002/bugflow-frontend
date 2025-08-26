import React, { useState } from "react";
import { signup } from "../services/api";

// PUBLIC_INTERFACE
export function Signup({ onSuccess, onSwitchToLogin, onError }) {
  /**
   * Signup form with email/password/confirm validation and API call.
   */
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localErr, setLocalErr] = useState("");
  const [success, setSuccess] = useState("");

  const validate = () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setLocalErr("Please enter a valid email address.");
      return false;
    }
    if (!password || password.length < 6) {
      setLocalErr("Password must be at least 6 characters.");
      return false;
    }
    if (password !== confirm) {
      setLocalErr("Passwords do not match.");
      return false;
    }
    setLocalErr("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onError?.("");
    setSuccess("");
    if (!validate()) return;
    setLoading(true);
    try {
      await signup({ email, password, full_name: fullName });
      setSuccess("Signup successful. You can now sign in.");
      onSuccess?.();
    } catch (err) {
      const message = err?.message || "Signup failed";
      setLocalErr(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card">
        <h1 className="title">Create account</h1>
        <p className="muted">Join BugFlow in a few seconds</p>
        {localErr ? <div className="alert">{localErr}</div> : null}
        {success ? <div className="alert success">{success}</div> : null}
        <form onSubmit={handleSubmit} className="form">
          <label className="label" htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            type="text"
            className="input"
            placeholder="Ada Lovelace"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
          />
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
              autoComplete="new-password"
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
          <label className="label" htmlFor="confirm">Confirm password</label>
          <input
            id="confirm"
            type={showPw ? "text" : "password"}
            className="input"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
          />
          <button className="btn" type="submit" disabled={loading}>
            {loading ? <span className="spinner inline" /> : null}
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <div className="hint">
          Already have an account?{" "}
          <button className="link" type="button" onClick={onSwitchToLogin}>
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
