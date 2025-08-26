import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import ThemeDemo from './components/ThemeDemo';
import './App.css';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('dark'); // Default to dark theme for Nord
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userProfile = localStorage.getItem('userProfile');
    
    if (token && userProfile) {
      try {
        const user = JSON.parse(userProfile);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user profile:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userProfile');
      }
    }
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // PUBLIC_INTERFACE
  const handleAuthSuccess = (response) => {
    setCurrentUser(response.user);
    setIsAuthenticated(true);
  };

  // PUBLIC_INTERFACE
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: 'var(--font-size-4xl)', 
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem'
          }}>
            Welcome to BugFlow
          </h1>
          
          {currentUser && (
            <p style={{ 
              fontSize: 'var(--font-size-lg)', 
              color: 'var(--text-secondary)',
              marginBottom: '1rem'
            }}>
              Hello, {currentUser.first_name} {currentUser.last_name}!
            </p>
          )}
          
          <button 
            onClick={handleLogout}
            style={{
              backgroundColor: 'var(--btn-secondary-bg)',
              color: 'var(--btn-secondary-text)',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: 'var(--font-size-base)',
              fontFamily: 'var(--font-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Sign Out
          </button>
        </div>
        
        <ThemeDemo />
      </header>
    </div>
  );
}

export default App;
