import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';

// PUBLIC_INTERFACE
function App() {
  /** Root app rendering auth routes. */
  return (
    <BrowserRouter>
      <div className="app-shell">
        <div className="card">
          <header className="app-header">
            <h1 className="app-title">BugFlow</h1>
          </header>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
