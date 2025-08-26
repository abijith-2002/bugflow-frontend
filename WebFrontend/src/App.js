import React, { useState, useEffect } from 'react';
import ThemeDemo from './components/ThemeDemo';
import AuthPage from './components/AuthPage';
import './App.css';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('dark'); // Default to dark theme (Nord)
  const [currentView, setCurrentView] = useState('welcome'); // 'welcome', 'auth', 'demo', 'dashboard'
  const [user, setUser] = useState(null);

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // PUBLIC_INTERFACE
  const showDemo = () => {
    setCurrentView('demo');
  };

  // PUBLIC_INTERFACE
  const showWelcome = () => {
    setCurrentView('welcome');
  };

  // PUBLIC_INTERFACE
  const showAuth = () => {
    setCurrentView('auth');
  };

  // PUBLIC_INTERFACE
  const handleAuthSuccess = (authData) => {
    setUser(authData.user);
    setCurrentView('dashboard');
  };

  // PUBLIC_INTERFACE
  const handleLogout = () => {
    setUser(null);
    setCurrentView('welcome');
  };

  // Render different views based on current state
  const renderContent = () => {
    switch (currentView) {
      case 'auth':
        return <AuthPage onAuthSuccess={handleAuthSuccess} />;
      case 'demo':
        return <ThemeDemo />;
      case 'dashboard':
        return (
          <div className="welcome-section">
            <div className="welcome-card card">
              <h2>Welcome, {user?.firstName || user?.email}!</h2>
              <p>You've successfully logged into BugFlow. Your dashboard is coming soon.</p>
              <div className="demo-actions">
                <button className="btn btn-primary" onClick={showDemo}>
                  View Theme Demo
                </button>
                <button className="btn btn-secondary" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        );
      default: // 'welcome'
        return (
          <div className="welcome-section">
            <div className="welcome-card card">
              <h2>Welcome to BugFlow</h2>
              <p>
                A modern bug tracking application built with React.js, FastAPI, and Supabase.
                This application uses the Nord theme color palette and Reddit Sans font
                for a clean, professional user interface.
              </p>
              
              <div className="feature-list">
                <h3>Features:</h3>
                <ul>
                  <li>🎨 Nord Theme Color Palette</li>
                  <li>🔤 Reddit Sans Typography</li>
                  <li>📱 Responsive Design</li>
                  <li>🌙 Dark/Light Theme Support</li>
                  <li>🐛 Bug Tracking & Management</li>
                  <li>👥 User Authentication</li>
                  <li>📊 Project Dashboard</li>
                </ul>
              </div>

              <div className="demo-actions">
                <button className="btn btn-primary" onClick={showAuth}>
                  Get Started
                </button>
                <button className="btn btn-secondary" onClick={showDemo}>
                  View Theme Demo
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="App">
      {currentView !== 'auth' && (
        <nav className="app-nav">
          <div className="nav-content">
            <h1 className="app-title">BugFlow - Bug Tracking System</h1>
            <div className="nav-controls">
              {currentView !== 'welcome' && (
                <button 
                  className="btn btn-secondary"
                  onClick={showWelcome}
                >
                  Home
                </button>
              )}
              {currentView !== 'demo' && (
                <button 
                  className="btn btn-secondary"
                  onClick={showDemo}
                >
                  Theme Demo
                </button>
              )}
              {!user && currentView !== 'auth' && (
                <button 
                  className="btn btn-primary"
                  onClick={showAuth}
                >
                  Sign In
                </button>
              )}
              {user && (
                <button 
                  className="btn btn-secondary"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              )}
              <button 
                className="btn btn-primary theme-toggle" 
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? '🌙 Nord Dark' : '☀️ Light Mode'}
              </button>
            </div>
          </div>
        </nav>
      )}

      <main className="app-main">
        {renderContent()}
      </main>

      {currentView !== 'auth' && (
        <footer className="app-footer">
          <p>
            Built with ❤️ using React.js • Current theme: <strong>{theme === 'dark' ? 'Nord Dark' : 'Light'}</strong>
            {user && <span> • Logged in as: {user.email}</span>}
          </p>
        </footer>
      )}
    </div>
  );
}

export default App;
