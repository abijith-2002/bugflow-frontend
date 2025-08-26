import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import { getApiBaseUrl, setApiBaseUrl, pingHealth } from './apiConfig';

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

  return (
    <BrowserRouter>
      {/* Global app header at the very top of the page */}
      <header className="global-app-header">
        <div className="app-title-wrapper">
          <svg 
            className="bug-icon" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="6" />
            <path d="M12 3V6" />
            <path d="M12 18v3" />
            <path d="M8 9l-3-3" />
            <path d="M16 9l3-3" />
            <path d="M8 15l-3 3" />
            <path d="M16 15l3 3" />
            <circle cx="10" cy="10" r="1" fill="currentColor" />
            <circle cx="14" cy="10" r="1" fill="currentColor" />
          </svg>
          <h1 className="app-title">BugFlow</h1>
        </div>

        {/* Right-aligned status indicator */}
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
      </header>

      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<div className="card"><LoginPage /></div>} />
          <Route path="/signup" element={<div className="card"><SignUpPage /></div>} />
          <Route path="/dashboard" element={<DashboardPage />} />
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
