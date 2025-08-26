import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
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
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <div className="row" style={{ marginTop: 12 }}>
            <Link className="link" to="/login">Login</Link>
            <Link className="link" to="/signup">Sign up</Link>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
