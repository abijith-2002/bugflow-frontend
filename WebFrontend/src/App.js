import React, { useState, useEffect } from 'react';
import ThemeDemo from './components/ThemeDemo';
import './App.css';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('dark'); // Default to dark theme (Nord)
  const [showDemo, setShowDemo] = useState(true);

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // PUBLIC_INTERFACE
  const toggleDemo = () => {
    setShowDemo(prev => !prev);
  };

  return (
    <div className="App">
      <nav className="app-nav">
        <div className="nav-content">
          <h1 className="app-title">BugFlow - Bug Tracking System</h1>
          <div className="nav-controls">
            <button 
              className="btn btn-secondary"
              onClick={toggleDemo}
            >
              {showDemo ? 'Hide Demo' : 'Show Theme Demo'}
            </button>
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

      <main className="app-main">
        {showDemo ? (
          <ThemeDemo />
        ) : (
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
                <button className="btn btn-primary" onClick={toggleDemo}>
                  View Theme Demo
                </button>
                <button className="btn btn-secondary">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Built with ❤️ using React.js • Current theme: <strong>{theme === 'dark' ? 'Nord Dark' : 'Light'}</strong>
        </p>
      </footer>
    </div>
  );
}

export default App;
