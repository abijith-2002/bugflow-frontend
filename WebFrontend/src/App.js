import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Bugs from './pages/Bugs';
import BugDetail from './pages/BugDetail';
import ReportBug from './pages/ReportBug';
import Notifications from './pages/Notifications';
import Admin from './pages/Admin';
import Account from './pages/Account';
import AuthCallback from './pages/AuthCallback';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');

  // Apply theme data-attribute for CSS variables
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    /** Toggle between light and dark theme. */
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <div className="container">
            <div className="top-actions">
              <button
                className="btn"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
              </button>
            </div>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/projects" element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              } />
              <Route path="/bugs" element={
                <ProtectedRoute>
                  <Bugs />
                </ProtectedRoute>
              } />
              <Route path="/bugs/:id" element={
                <ProtectedRoute>
                  <BugDetail />
                </ProtectedRoute>
              } />
              <Route path="/report" element={
                <ProtectedRoute>
                  <ReportBug />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="/account" element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              } />
              <Route path="*" element={<div>Not Found</div>} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
