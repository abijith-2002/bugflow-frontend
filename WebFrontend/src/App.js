import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './App.css';
import { getApiBase, setApiBase, subscribeApiBase } from './config';

// PUBLIC_INTERFACE
/**
 * App is the main layout shell. It enforces Nord dark theme and renders nav + route outlet.
 * It also shows an online status indicator that polls backend health and lets user change API base URL.
 */
function App() {
  const location = useLocation();

  // Enforce Nord dark theme permanently
  useEffect(() => {
    document.documentElement.removeAttribute('data-theme'); // ensure defaults from :root (dark Nord)
  }, []);

  // Online/offline indicator state
  const [apiBase, setApiBaseState] = useState(getApiBase());
  const [online, setOnline] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const inputRef = useRef(null);

  // Subscribe to base changes (e.g., from modal)
  useEffect(() => {
    const unsub = subscribeApiBase((url) => setApiBaseState(url));
    return unsub;
  }, []);

  // Health check function
  const healthUrl = useMemo(() => `${apiBase}/`, [apiBase]);

  useEffect(() => {
    let stop = false;

    async function ping() {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(healthUrl, { method: 'GET', signal: controller.signal });
        clearTimeout(timeout);
        if (!stop) setOnline(res.ok);
      } catch {
        if (!stop) setOnline(false);
      }
    }

    // immediate check, then interval
    ping();
    const id = setInterval(ping, 20000); // 20 seconds
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [healthUrl]);

  // Modal handlers
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);
  const applyNewBase = (e) => {
    e.preventDefault();
    const val = inputRef.current?.value?.trim();
    if (!val) return;
    setApiBase(val); // updates config + localStorage + notifies subscribers
    setShowModal(false);
  };

  return (
    <div className="App">
      <header className="nf-navbar" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="nf-brand">BugFlow</div>
        <nav className="nf-nav-links">
          <Link className={`nf-link ${location.pathname === '/login' ? 'active' : ''}`} to="/login">Login</Link>
          <Link className={`nf-link ${location.pathname === '/signup' ? 'active' : ''}`} to="/signup">Sign up</Link>
        </nav>

        {/* Online status indicator and API base changer */}
        <div
          onClick={openModal}
          title={`Backend: ${apiBase}\nClick to change`}
          aria-label={`Backend status: ${online ? 'online' : 'offline'}. Click to change API base URL`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: online ? '#34D399' : '#EF4444',
              boxShadow: online ? '0 0 8px rgba(52,211,153,0.6)' : '0 0 8px rgba(239,68,68,0.6)',
              border: '1px solid var(--border-color)'
            }}
          />
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            {online ? 'Online' : 'Offline'}
          </span>
        </div>
      </header>

      <main className="nf-container">
        <Outlet />
      </main>

      <footer className="nf-footer">
        <span>© {new Date().getFullYear()} BugFlow</span>
      </footer>

      {/* Simple modal for editing API base URL */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Change API Base URL"
          onClick={closeModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 50
          }}
        >
          <div
            className="nf-card"
            style={{ maxWidth: 520, width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="nf-title" style={{ fontSize: 18, marginBottom: 10 }}>Backend API Base URL</h2>
            <p className="nf-subtitle" style={{ marginBottom: 16 }}>
              Enter the base URL for the backend API. Example: http://localhost:3001
            </p>
            <form className="nf-form" onSubmit={applyNewBase}>
              <div className="nf-field">
                <label className="nf-label" htmlFor="api-base-input">API Base URL</label>
                <input
                  id="api-base-input"
                  className="nf-input"
                  type="text"
                  defaultValue={apiBase}
                  ref={inputRef}
                  placeholder="http://localhost:3001"
                />
              </div>
              <div className="nf-row" style={{ justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="nf-btn" style={{ background: 'var(--nord3)' }} onClick={closeModal}>Cancel</button>
                <button type="submit" className="nf-btn">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
