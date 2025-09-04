import React, { useState } from "react";
import { fetchDisplayNameByUserId } from "../userProfileApi";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus("Logging in...");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || `Login failed (${res.status})`);
      }
      const data = await res.json();

      const userId = data?.user_id;
      let displayName = null;

      if (userId) {
        try {
          const profile = await fetchDisplayNameByUserId(userId);
          displayName = profile?.display_name || null;
        } catch (e) {
          // do not block login if profile fetch fails
          // eslint-disable-next-line no-console
          console.warn("Failed to fetch display name:", e);
        }
      }

      // Store session info as needed by the app
      localStorage.setItem("access_token", data?.access_token || "");
      localStorage.setItem("user_id", userId || "");
      if (displayName) {
        localStorage.setItem("display_name", displayName);
      }

      setStatus("Logged in");
      // Navigate or update app state as necessary
      // e.g., window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message || "Unexpected error");
      setStatus(null);
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: "40px auto" }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ display: "block", width: "100%" }}
            required
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ display: "block", width: "100%" }}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {status && <p>{status}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
