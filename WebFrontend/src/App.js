import React, { useEffect, useMemo, useRef, useState } from 'react';
import bugIcon from './assets/bug.svg';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './index.css';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import WorkItemDetailPage from './pages/WorkItemDetailPage';
import { getApiBaseUrl, setApiBaseUrl, pingHealth, loadApiBaseUrlFromStorage, getApiDiagnostics } from './apiConfig';
import { isAuthenticated, clearAuth, getDisplayName } from './auth';

// PUBLIC_INTERFACE
function ProtectedRoute({ children }) {
  /** Guard component that renders children only if authenticated, else redirects to /login. */
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function useOutsideClick(ref, onOutside) {
  // Close menus when clicking outside
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) onOutside?.(e);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [ref, onOutside]);
  return null;
}

// PUBLIC_INTERFACE
function UserAvatar() {
  /** Renders a circular avatar at top-right showing initials and display name, with a dropdown for logout. */
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState(0); // bump to re-read getDisplayName on auth changes
  const wrapRef = useRef(null);
  useOutsideClick(wrapRef, () => setOpen(false));

  // Listen to cross-tab storage events and in-tab custom auth change events
  useEffect(() => {
    const onStorage = (e) => {
      if (!e) return;
      // React only when our auth-related keys change
      if (e.key === 'bugflow.auth.user' || e.key === 'bugflow.auth.token' || e.key === null) {
        setVersion((v) => v + 1);
      }
    };
    const onLocal = () => setVersion((v) => v + 1);
    window.addEventListener('storage', onStorage);
    window.addEventListener('bugflow:auth-changed', onLocal);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('bugflow:auth-changed', onLocal);
    };
  }, []);

  // Prefer display_name from backend via saved displayName, fallback to Anonymous
  const rawName = getDisplayName();
  const nameToShow = (rawName && String(rawName).trim()) ? rawName.trim() : 'Anonymous';

  const initials = (() => {
    const n = nameToShow.trim();
    if (!n) return 'A';
    const parts = n.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || '';
    const second = parts.length > 1 ? parts[1][0] : '';
    return (first + second).toUpperCase() || n[0].toUpperCase();
  })();

  if (!isAuthenticated()) return null;

  const onLogout = () => {
    clearAuth();
    // Client-side navigation to login to avoid full reloads
    navigate('/login', { replace: true });
  };

  return (
    <div className="user-avatar-wrap" ref={wrapRef} style={{ position: 'relative' }}>
      <button
        className="user-avatar-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        type="button"
        title={nameToShow || 'Account'}
      >
        <span className="user-avatar-circle" aria-hidden="true">{initials}</span>
        <span className="user-avatar-name">{nameToShow}</span>
      </button>
      {open && (
        <div className="user-menu" role="menu" aria-label="User menu">
          <button className="user-menu-item" role="menuitem" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** Root app rendering auth routes with header showing online status and API URL settings modal. */
  const [online, setOnline] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [urlInput, setUrlInput] = useState(getApiBaseUrl());
  const [lastCheckedAt, setLastCheckedAt] = useState(null);

  // Abort handling for pings and an interval every 5 seconds
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const check = async () => {
      const ok = await pingHealth(controller.signal);
      if (mounted) {
        setOnline(ok);
        setLastCheckedAt(Date.now());
      }
    };

    // initial check
    check();
    const id = setInterval(check, 5000);

    return () => {
      mounted = false;
      controller.abort();
      clearInterval(id);
    };
  }, []);

  // When base URL changes (saved from modal), refresh the input and immediately re-check status
  const handleOpenModal = () => {
    setUrlInput(getApiBaseUrl());
    setShowModal(true);
  };
  const handleCloseModal = () => setShowModal(false);

  const handleSaveUrl = async () => {
    const normalized = setApiBaseUrl(urlInput);
    setUrlInput(normalized);
    setShowModal(false);
    // ping once after saving to reflect new status quickly
    try {
      const ok = await pingHealth();
      setOnline(ok);
      setLastCheckedAt(Date.now());
    } catch {
      setOnline(false);
    }
  };

  // Clear a persisted local override if present (helps when production is HTTPS but override points to localhost)
  const handleClearApiOverride = async () => {
    try {
      localStorage.removeItem('bugflow.apiBaseUrl');
    } catch {
      // ignore
    }
    const effective = loadApiBaseUrlFromStorage();
    setUrlInput(effective);
    try {
      const ok = await pingHealth();
      setOnline(ok);
      setLastCheckedAt(Date.now());
    } catch {
      setOnline(false);
    }
  };

  // Accessibility: focus trap for modal
  const modalRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);
  useEffect(() => {
    if (!showModal) return;
    // focus the input on open
    const input = modalRef.current?.querySelector('input, button, [href], select, textarea, [tabindex]:not([tabindex="-1"])');
    input?.focus();

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = modalRef.current?.querySelectorAll('input, button, [href], select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showModal]);

  const statusLabel = useMemo(() => (online ? 'Online' : 'Offline'), [online]);
  const diagnostics = useMemo(() => getApiDiagnostics(), [urlInput, online, lastCheckedAt, showModal]);

  const showConfigBanner =
    diagnostics?.isHttpsOrigin &&
    (diagnostics?.baseHostIsLocal || diagnostics?.isMixedContentRisk);

  return (
    <BrowserRouter>
      {/* Global app header at the very top of the page */}
      <header className="global-app-header">
        <div className="app-title-wrapper">
          <img
            src={bugIcon}
            alt=""
            className="bug-icon"
            width="24"
            height="24"
            aria-hidden="true"
          />
          <h1 className="app-title">BugFlow</h1>
        </div>

        {/* Right-aligned status indicator and user avatar */}
        <div className="spacer" />
        <button
          className={`status-indicator ${online ? 'online' : 'offline'}`}
          aria-live="polite"
          aria-label={`Backend status: ${statusLabel}. Click to configure API URL.`}
          title={`Backend is ${statusLabel}. Click to configure API URL.`}
          type="button"
          onClick={handleOpenModal}
        >
          <span className="dot" aria-hidden="true" />
          <span className="status-text">{statusLabel}</span>
        </button>

        {/* Avatar with dropdown (visible when authenticated) */}
        <UserAvatar />
      </header>

      {/* Optional production-time misconfig banner */}
      {showConfigBanner && (
        <div
          role="alert"
          style={{
            background: 'rgba(191,97,106,0.12)',
            border: '1px solid rgba(191,97,106,0.35)',
            color: 'var(--nord6)',
            padding: '10px 12px',
            borderRadius: 8,
            margin: '10px 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }}
          title="API base URL misconfiguration"
        >
          <span style={{ fontWeight: 600, color: '#BF616A' }}>Warning:</span>
          <span style={{ color: 'var(--nord6)' }}>
            App is served over HTTPS but the API base is{' '}
            <span className="code">{getApiBaseUrl()}</span>
            {diagnostics?.baseHostIsLocal ? ' (localhost override).' : '.'} Browsers may block requests as mixed content.
            Please configure an HTTPS API base for production.
          </span>
          <div style={{ display: 'inline-flex', gap: 8 }}>
            <button className="btn btn-secondary" type="button" onClick={handleOpenModal} style={{ width: 'auto' }}>
              Open Settings
            </button>
            <button className="btn btn-secondary" type="button" onClick={handleClearApiOverride} style={{ width: 'auto' }}>
              Clear Override
            </button>
          </div>
        </div>
      )}

      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<div className="card"><LoginPage /></div>} />
          <Route path="/signup" element={<div className="card"><SignUpPage /></div>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/project/:id" element={<ProtectedRoute><ProjectDetailsPage /></ProtectedRoute>} />
          <Route path="/project/:projectId/item/:itemId" element={<ProtectedRoute><WorkItemDetailPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>

      {/* Centered Modal for API Base URL */}
      {showModal && (
        <div className="modal-backdrop" role="presentation">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="api-url-title"
            ref={modalRef}
          >
            <h2 id="api-url-title" className="modal-title">Backend API Settings</h2>
            <p className="modal-subtitle">Set the base URL for the backend API. Example: https://api.example.com</p>
            <div className="form" style={{ marginTop: 8 }}>
              <div>
                <label className="label" htmlFor="api-base-url">Base API URL</label>
                <input
                  id="api-base-url"
                  className="input"
                  type="url"
                  placeholder="http://localhost:3001"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  required
                />
              </div>
              <div className="row" style={{ marginTop: 8 }}>
                <button className="btn btn-secondary" type="button" onClick={handleCloseModal} ref={firstFocusableRef}>
                  Cancel
                </button>
                <button className="btn" type="button" onClick={handleSaveUrl} ref={lastFocusableRef}>
                  Save
                </button>
              </div>
            </div>
            <div className="modal-hint">
              {lastCheckedAt ? <span className="hint">Last check: {new Date(lastCheckedAt).toLocaleTimeString()}</span> : null}
            </div>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;
