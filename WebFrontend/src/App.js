import React, { useEffect, useMemo, useRef, useState } from 'react';
import bugIcon from './assets/bug.svg';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import WorkItemDetailPage from './pages/WorkItemDetailPage';
import { getApiBaseUrl, setApiBaseUrl, pingHealth } from './apiConfig';
import { isAuthenticated, clearAuth, getAuthUser } from './auth';

// PUBLIC_INTERFACE
function ProtectedRoute({ children }) {
  /** Guard component that renders children only if authenticated, else redirects to /login. */
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
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

  // Compute display name and initials from saved auth user
  const authUser = getAuthUser();
  const displayName = useMemo(() => {
    if (!authUser) return null;
    // Try common fields: username, name, display_name, email, id
    const name = (authUser.username || authUser.name || authUser.display_name || authUser.email || '').toString().trim();
    if (name) return name;
    if (authUser.id) return String(authUser.id).slice(0, 8);
    return null;
  }, [authUser]);

  const initials = useMemo(() => {
    const src = displayName || (authUser && (authUser.email || '')) || '';
    if (!src) return 'U';
    const parts = src.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }, [displayName, authUser]);

  const [menuOpen, setMenuOpen] = useState(false);

  const onLogout = () => {
    // Clear auth and redirect to login
    clearAuth();
    setMenuOpen(false);
    window.location.assign('/login');
  };

  // Close menu when clicking outside
  const avatarMenuRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e) => {
      if (!avatarMenuRef.current) return;
      if (!avatarMenuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

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

        <div className="spacer" />

        {/* Right-aligned status indicator */}
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

        {/* User avatar and name (only if authenticated) */}
        {isAuthenticated() ? (
          <div
            className="userbox"
            ref={avatarMenuRef}
            style={{ position: 'relative', marginLeft: 10 }}
          >
            <button
              className="userbox-trigger"
              type="button"
              onClick={() => setMenuOpen(v => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              title={displayName || 'Account'}
            >
              <span className="userbox-name">{displayName || 'User'}</span>
              <span className="avatar" aria-hidden="true">
                {initials}
              </span>
            </button>

            {menuOpen ? (
              <div
                role="menu"
                className="userbox-menu"
              >
                <button
                  role="menuitem"
                  type="button"
                  className="userbox-item"
                  onClick={onLogout}
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </header>

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
