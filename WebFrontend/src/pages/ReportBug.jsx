import React, { useState } from 'react';
import { Api } from '../services/api';

export default function ReportBug() {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', project_id: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await Api.createBug(form);
      setMessage('Bug reported successfully.');
      setForm({ title: '', description: '', priority: 'medium', project_id: '' });
    } catch {
      setMessage('Could not submit bug, please try again later.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2>Report a Bug</h2>
      <div className="card">
        {message && <div className="text-muted">{message}</div>}
        <form onSubmit={onSubmit}>
          <label className="label">Title</label>
          <input className="input" name="title" value={form.title} onChange={onChange} required />

          <label className="label">Description</label>
          <textarea className="textarea" name="description" value={form.description} onChange={onChange} required />

          <label className="label">Priority</label>
          <select className="select" name="priority" value={form.priority} onChange={onChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <label className="label">Project ID</label>
          <input className="input" name="project_id" value={form.project_id} onChange={onChange} placeholder="Optional" />

          <button className="btn" type="submit" disabled={saving}>{saving ? 'Submitting...' : 'Submit Bug'}</button>
        </form>
      </div>
    </div>
  );
}
