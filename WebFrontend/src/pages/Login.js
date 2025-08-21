import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bug, Eye, EyeOff } from 'lucide-react';

// PUBLIC_INTERFACE
const Login = () => {
  /**
   * Login page component with email/password authentication
   * @returns {JSX.Element} Login page
   */
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bug size={40} className="text-primary" style={{ color: 'var(--accent-primary)' }} />
            <h1 className="text-3xl font-bold">BugFlow</h1>
          </div>
          <p className="text-muted">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-error text-error" style={{ 
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--accent-error)',
            fontSize: 'var(--text-sm)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input"
                placeholder="Enter your password"
                style={{ paddingRight: '40px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 'var(--space-2)'
            }}
          >
            {loading && <div className="spinner" style={{ width: '16px', height: '16px' }}></div>}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted text-sm">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-primary hover:underline"
              style={{ color: 'var(--accent-primary)' }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
