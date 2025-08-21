import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bug, Eye, EyeOff } from 'lucide-react';

// PUBLIC_INTERFACE
const Register = () => {
  /**
   * Registration page component for new user signup
   * @returns {JSX.Element} Register page
   */
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      await register(formData.email, formData.password, formData.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
          <p className="text-muted">Create your account</p>
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
            <label htmlFor="role" className="block text-sm font-medium mb-2">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="select input"
            >
              <option value="user">User</option>
              <option value="project_manager">Project Manager</option>
              <option value="admin">Admin</option>
            </select>
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input"
                placeholder="Confirm your password"
                style={{ paddingRight: '40px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted text-sm">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-primary hover:underline"
              style={{ color: 'var(--accent-primary)' }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
