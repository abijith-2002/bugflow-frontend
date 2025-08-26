import React, { useState } from 'react';
import { signupUser, getErrorMessage, validateEmail, validatePassword } from '../utils/api';
import './Auth.css';

// PUBLIC_INTERFACE
function Signup({ onSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: ''
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
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }
    
    // First name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    // Last name validation
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
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
      const response = await signupUser({
        email: formData.email.trim(),
        password: formData.password,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim()
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
      if (error.status === 400 && error.message.includes('email')) {
        setErrors({
          email: 'This email address is already registered'
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join BugFlow to start tracking bugs</p>
        </div>

        {apiError && (
          <div className="auth-error">
            <p className="auth-error-message">{apiError}</p>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-row">
            <div className="auth-form-group">
              <label htmlFor="first_name" className="auth-label">
                First Name
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className={`auth-input ${errors.first_name ? 'error' : ''}`}
                placeholder="First name"
                disabled={isLoading}
                autoComplete="given-name"
              />
              {errors.first_name && (
                <div className="auth-field-error">{errors.first_name}</div>
              )}
            </div>

            <div className="auth-form-group">
              <label htmlFor="last_name" className="auth-label">
                Last Name
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className={`auth-input ${errors.last_name ? 'error' : ''}`}
                placeholder="Last name"
                disabled={isLoading}
                autoComplete="family-name"
              />
              {errors.last_name && (
                <div className="auth-field-error">{errors.last_name}</div>
              )}
            </div>
          </div>

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
              placeholder="Create a password (min. 8 characters)"
              disabled={isLoading}
              autoComplete="new-password"
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
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Already have an account?{' '}
            <button
              type="button"
              className="auth-footer-link"
              onClick={onSwitchToLogin}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
