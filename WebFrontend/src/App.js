import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './App.css';

// PUBLIC_INTERFACE
/**
 * App is the main layout shell. It applies theme, Reddit Sans font, and renders nav + route outlet.
 */
function App() {
  const [theme, setTheme] = useState('dark'); // default to Nord-like dark
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="App">
      <header className="nf-navbar">
        <div className="nf-brand">BugFlow</div>
        <nav className="nf-nav-links">
          <Link className={`nf-link ${location.pathname === '/login' ? 'active' : ''}`} to="/login">Login</Link>
          <Link className={`nf-link ${location.pathname === '/signup' ? 'active' : ''}`} to="/signup">Sign up</Link>
        </nav>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>

      <main className="nf-container">
        <Outlet />
      </main>

      <footer className="nf-footer">
        <span>© {new Date().getFullYear()} BugFlow</span>
      </footer>
    </div>
  );
}

export default App;
