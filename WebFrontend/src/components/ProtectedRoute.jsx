import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PUBLIC_INTERFACE
 * Protects routes by redirecting to /login when user is not authenticated.
 * @param {React.ReactNode} children - The protected component tree
 */
export default function ProtectedRoute({ children }) {
  /** Wraps children and ensures the user is authenticated. */
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="container" style={{ padding: 24 }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
