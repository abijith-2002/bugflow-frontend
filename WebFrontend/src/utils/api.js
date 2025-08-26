// API utility functions for authentication

const API_BASE_URL = 'http://localhost:3001';

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

/**
 * Make API request with error handling
 */
// PUBLIC_INTERFACE
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, finalOptions);
    
    // Parse response body
    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    if (!response.ok) {
      // Handle API error responses
      const errorMessage = responseData?.detail || 
                          responseData?.message || 
                          `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, responseData);
    }
    
    return responseData;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new ApiError('Network error. Please check your internet connection.', 0, null);
    }
    
    throw new ApiError(error.message || 'An unexpected error occurred', 0, null);
  }
}

/**
 * User signup
 */
// PUBLIC_INTERFACE
export async function signupUser(userData) {
  return apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

/**
 * User login
 */
// PUBLIC_INTERFACE
export async function loginUser(credentials) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

/**
 * Verify token
 */
// PUBLIC_INTERFACE
export async function verifyToken(token) {
  return apiRequest('/auth/verify', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

/**
 * Get user-friendly error message
 */
// PUBLIC_INTERFACE
export function getErrorMessage(error) {
  if (error instanceof ApiError) {
    // Handle specific error cases
    if (error.status === 400) {
      return error.message || 'Invalid request. Please check your input.';
    } else if (error.status === 401) {
      return 'Invalid email or password.';
    } else if (error.status === 422) {
      // Handle validation errors
      if (error.response?.detail && Array.isArray(error.response.detail)) {
        const firstError = error.response.detail[0];
        if (firstError?.msg) {
          return firstError.msg;
        }
      }
      return 'Please check your input and try again.';
    } else if (error.status === 500) {
      return 'Server error. Please try again later.';
    } else if (error.status === 0) {
      return error.message;
    }
    
    return error.message || 'An error occurred. Please try again.';
  }
  
  return error.message || 'An unexpected error occurred.';
}

/**
 * Validate email format
 */
// PUBLIC_INTERFACE
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
// PUBLIC_INTERFACE
export function validatePassword(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export { ApiError };
