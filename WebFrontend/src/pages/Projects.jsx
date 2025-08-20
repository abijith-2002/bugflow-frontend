import React, { useEffect, useState } from 'react';
import { Api } from '../services/api';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Api.listProjects().then(setProjects).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    await Api.createProject(form);
    setForm({ name: '', description: '' });
    load();
  };

  return (
    <div>
      <h2>Projects</h2>
      <div className="card">
        <h3>Create Project</h3>
        <form onSubmit={onSubmit}>
          <input className="input" name="name" placeholder="Project name" value={form.name} onChange={onChange} required />
          <textarea className="textarea" name="description" placeholder="Description" value={form.description} onChange={onChange} />
          <button className="btn" type="submit">Create</button>
        </form>
      </div>
      <div className="card">
        <h3>Project List</h3>
        {loading ? <div>Loading...</div> : (
          <ul className="list">
            {projects.map((p, idx) => (
              <li className="list-item" key={p.id || idx}>
                <strong>{p.name || 'Untitled'}</strong>
                <div className="text-muted">{p.description}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
