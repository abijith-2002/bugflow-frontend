import React, { useEffect, useMemo, useState } from 'react';
import '../styles/DashboardPage.css';
import { buildUrl } from '../api';
import { getApiBaseUrl } from '../apiConfig';

const THEME_COLORS = [
  '#88C0D0', // nord8
  '#81A1C1', // nord9
  '#5E81AC', // nord10
  '#BF616A', // nord11
  '#D08770', // nord12
  '#EBCB8B', // nord13
  '#A3BE8C', // nord14
  '#B48EAD', // nord15
];

// PUBLIC_INTERFACE
export default function DashboardPage() {
  /** Dashboard: fetches projects from backend and displays them. Also includes a modal stub for creating projects. */
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectKey, setProjectKey] = useState('');
  const [selectedColor, setSelectedColor] = useState(THEME_COLORS[0]);

  const [error, setError] = useState('');
  const [listError, setListError] = useState('');
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  const apiBase = getApiBaseUrl();

  // Fetch projects from backend /projects on mount and when API base URL changes
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setListError('');
      try {
        const resp = await fetch(buildUrl('/projects'), { method: 'GET', signal: controller.signal });
        if (!resp.ok) {
          const text = await resp.text();
          let data = null;
          try { data = text ? JSON.parse(text) : null; } catch { /* ignore */ }
          const message = (data && (data.detail || data.message || data.error)) || `Failed to load projects (${resp.status})`;
          throw new Error(message);
        }
        const data = await resp.json();
        if (mounted) {
          // Normalize to expected fields with safe fallbacks
          const normalized = Array.isArray(data) ? data.map(p => ({
            id: p.id ?? String(Math.random()),
            name: p.name ?? 'Untitled',
            description: p.description ?? '',
            created_at: p.created_at ?? null,
          })) : [];
          setProjects(normalized);
        }
      } catch (err) {
        if (mounted) {
          setListError(err?.message || 'Failed to load projects');
          setProjects([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [apiBase]);

  const handleCreateProject = (e) => {
    e.preventDefault();
    setError('');

    if (!projectName.trim() || !projectKey.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (projectKey.length < 2 || projectKey.length > 10) {
      setError('Project key must be between 2-10 characters');
      return;
    }

    // Placeholder for create: will be wired to POST /projects in a subsequent step
    // Keeping UI consistent with current template behavior
    console.log('Creating project:', { projectName, projectKey, selectedColor });
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setProjectName('');
    setProjectKey('');
    setSelectedColor(THEME_COLORS[0]);
    setError('');
  };

  const emptyState = useMemo(() => !loading && projects.length === 0 && !listError, [loading, projects.length, listError]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Projects</h2>
        <button
          className="btn create-project-btn"
          onClick={() => setShowModal(true)}
          aria-label="Create new project"
        >
          Create New Project
        </button>
      </div>

      {loading ? (
        <div className="subtitle">Loading projects...</div>
      ) : listError ? (
        <div className="error" role="alert">{listError}</div>
      ) : emptyState ? (
        <div className="subtitle">No projects found. Create your first project to get started.</div>
      ) : (
        <div className="project-grid">
          {projects.map(project => (
            <div
              key={project.id}
              className="project-card"
              style={{ borderColor: '#434C5E' }} /* consistent neutral border; color theme may come from project later */
            >
              <h3>{project.name}</h3>
              {project.description ? (
                <p className="subtitle" style={{ marginTop: -6 }}>{project.description}</p>
              ) : null}
              <div className="project-stats">
                <div className="stat">
                  <span className="stat-label">Created</span>
                  <span className="stat-value">
                    {project.created_at ? new Date(project.created_at).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Bugs</span>
                  <span className="stat-value">—</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" role="presentation">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-project-title"
          >
            <h2 id="new-project-title" className="modal-title">Create New Project</h2>

            {error && <div className="error">{error}</div>}

            <form className="form" onSubmit={handleCreateProject}>
              <div>
                <label className="label" htmlFor="project-name">Project Name</label>
                <input
                  id="project-name"
                  className="input"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My Awesome Project"
                  required
                />
              </div>

              <div>
                <label className="label" htmlFor="project-key">Project Key</label>
                <input
                  id="project-key"
                  className="input"
                  type="text"
                  value={projectKey}
                  onChange={(e) => setProjectKey(e.target.value.toUpperCase())}
                  placeholder="PRJ"
                  maxLength={10}
                  required
                />
                <span className="input-hint">2-10 characters, uppercase</span>
              </div>

              <div>
                <label className="label">Theme Color</label>
                <div className="color-picker">
                  {THEME_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Select color ${color}`}
                      aria-pressed={selectedColor === color}
                    />
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
