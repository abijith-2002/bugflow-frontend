import React, { useEffect, useState } from "react";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { me, logout } from "./services/api";
import "./theme.css";

// Simple hash-based router for lightweight setup without extra deps
function useHashRoute() {
  const [route, setRoute] = useState(() => window.location.hash.replace("#", "") || "/login");

  useEffect(() => {
    const handler = () => {
      const r = window.location.hash.replace("#", "") || "/login";
      setRoute(r);
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  // PUBLIC_INTERFACE
  const navigate = (path) => {
    window.location.hash = path;
  };

  return { route, navigate };
}

// PUBLIC_INTERFACE
export default function App() {
  /**
   * Application root: sets Nord theme + Reddit Sans, manages primary navigation,
   * and renders Login/Signup based on hash route.
   */
  const { route, navigate } = useHashRoute();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "nord");
    setChecking(true);
    me()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  const onLogout = async () => {
    try {
      await logout();
    } catch (_) {
      // ignore
    }
    setUser(null);
    navigate("/login");
  };

  let content = null;
  if (checking) {
    content = <div className="card"><div className="spinner" /> Checking session...</div>;
  } else if (user) {
    content = (
      <div className="card">
        <h1 className="title">Welcome</h1>
        <p className="muted">You are signed in as {user.email || user.username || "user"}.</p>
        <div className="actions">
          <button className="btn btn-secondary" onClick={() => navigate("/login")}>Go to Login</button>
          <button className="btn btn-secondary" onClick={() => navigate("/signup")}>Go to Signup</button>
          <button className="btn" onClick={onLogout}>Logout</button>
        </div>
      </div>
    );
  } else {
    if (route === "/signup") {
      content = <Signup onSuccess={() => navigate("/login")} onSwitchToLogin={() => navigate("/login")} onError={setError} />;
    } else {
      content = <Login onSuccess={() => { setError(""); setUser({}); navigate("/"); }} onSwitchToSignup={() => navigate("/signup")} onError={setError} />;
    }
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">BugFlow</div>
        <div className="spacer" />
        <a className={`nav-link ${route === "/login" ? "active" : ""}`} href="#/login">Login</a>
        <a className={`nav-link ${route === "/signup" ? "active" : ""}`} href="#/signup">Signup</a>
      </nav>
      <main className="container">
        {error ? <div className="alert">{error}</div> : null}
        {content}
      </main>
      <footer className="footer">
        <span>Built with Nord palette • Reddit Sans</span>
      </footer>
    </div>
  );
}
