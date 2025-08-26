import React, { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AuthCallback from './pages/AuthCallback';

// Simple home component
function Home() {
  return (
    <section className="nf-card">
      <h1 className="nf-title">BugFlow</h1>
      <p className="nf-subtitle">A lightweight bug tracking app with FastAPI + React + Supabase</p>
      <p style={{ marginTop: 12 }}>
        Use the navigation above to login or create an account.
      </p>
    </section>
  );
}

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="App">
      <header className="App-header" style={{ paddingTop: 64 }}>
        {/* Minimal navigation/header */}
        <nav
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            zIndex: 10,
          }}
          aria-label="Main navigation"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link to="/" className="App-link" style={{ textDecoration: 'none' }}>
              Home
            </Link>
            <Link to="/login" className="App-link" style={{ textDecoration: 'none' }}>
              Login
            </Link>
            <Link to="/signup" className="App-link" style={{ textDecoration: 'none' }}>
              Signup
            </Link>
          </div>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          {/* Optional: 404 fallback */}
          <Route path="*" element={<section className="nf-card"><h1 className="nf-title">Not Found</h1><p className="nf-subtitle">The page you are looking for does not exist.</p></section>} />
        </Routes>
      </header>
    </div>
  );
}

export default App;
