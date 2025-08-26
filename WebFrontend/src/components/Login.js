import React, { useState } from 'react';
import { loginUser, getErrorMessage, validateEmail } from '../utils/api';
import './Auth.css';

// PUBLIC_INTERFACE
function Login({ onSuccess, onSwitchToSignup }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // PUBLIC_INTERFACE
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear API error when user modifies form
    if (apiError) {
      setApiError('');
    }
  };

  // PUBLIC_INTERFACE
  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // PUBLIC_INTERFACE
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setApiError('');
    
    try {
      const response = await loginUser({
        email: formData.email.trim(),
        password: formData.password
      });
      
      // Store authentication data
      localStorage.setItem('authToken', response.access_token);
      localStorage.setItem('userProfile', JSON.stringify(response.user));
      
      // Call success callback
      if (onSuccess) {
        onSuccess(response);
      }
      
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setApiError(errorMessage);
      
      // Handle specific field errors
      if (error.status === 401) {
        setErrors({
          email: ' ',
          password: ' '
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your BugFlow account</p>
        </div>

        {apiError && (
          <div className="auth-error">
            <p className="auth-error-message">{apiError}</p>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label htmlFor="email" className="auth-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`auth-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email"
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && (
              <div className="auth-field-error">{errors.email}</div>
            )}
          </div>

          <div className="auth-form-group">
            <label htmlFor="password" className="auth-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`auth-input ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
              disabled={isLoading}
              autoComplete="current-password"
            />
            {errors.password && (
              <div className="auth-field-error">{errors.password}</div>
            )}
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="auth-loading">
                <div className="auth-spinner"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Don't have an account?{' '}
            <button
              type="button"
              className="auth-footer-link"
              onClick={onSwitchToSignup}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
