import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signUp } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [err, setErr] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErr('');
    setMessage('');
    try {
      await signUp(form.email, form.password);
      setMessage('Sign up successful. Check your email for a confirmation link.');
    } catch (error) {
      setErr(error.message || 'Sign up failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Sign Up</h2>
      {message && <div className="card" style={{ background: '#e9fff0', borderColor: '#a6e9b7' }}>{message}</div>}
      {err && <div className="card" style={{ background: '#ffefef', borderColor: '#e9a6a6' }}>{err}</div>}
      <form onSubmit={onSubmit}>
        <label className="label" htmlFor="email">Email</label>
        <input className="input" id="email" name="email" type="email" value={form.email} onChange={onChange} required />

        <label className="label" htmlFor="password">Password</label>
        <input className="input" id="password" name="password" type="password" value={form.password} onChange={onChange} required />

        <button className="btn" type="submit" disabled={submitting}>{submitting ? 'Creating account...' : 'Create Account'}</button>
      </form>
      <p className="text-muted">Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}
