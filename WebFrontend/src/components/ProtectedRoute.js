import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// PUBLIC_INTERFACE
const ProtectedRoute = ({ children }) => {
  /**
   * Component to protect routes that require authentication
   * @param {Object} props - Component props
   * @param {React.ReactNode} props.children - Child components to render if authenticated
   * @returns {JSX.Element} Protected content or redirect to login
   */
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
