import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErr('');
    try {
      await signIn(form.email, form.password);
      navigate('/', { replace: true });
    } catch (error) {
      setErr(error.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Login</h2>
      {err && <div className="card" style={{ background: '#ffefef', borderColor: '#e9a6a6' }}>{err}</div>}
      <form onSubmit={onSubmit}>
        <label className="label" htmlFor="email">Email</label>
        <input className="input" id="email" name="email" type="email" value={form.email} onChange={onChange} required />

        <label className="label" htmlFor="password">Password</label>
        <input className="input" id="password" name="password" type="password" value={form.password} onChange={onChange} required />

        <button className="btn" type="submit" disabled={submitting}>{submitting ? 'Signing in...' : 'Sign In'}</button>
      </form>
      <p className="text-muted">No account? <Link to="/signup">Sign up</Link></p>
    </div>
  );
}
