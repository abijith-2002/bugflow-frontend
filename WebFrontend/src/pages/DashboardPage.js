import React, { useEffect, useMemo, useState } from 'react';
import '../styles/DashboardPage.css';
import { buildUrl, apiPost, getWorkItems } from '../api';
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
  /**
   * Dashboard:
   * - Fetches projects from backend and displays cards.
   * - Each card shows: title, creation date, bug and task counts, with border color from 'colour' column.
   * - Includes a modal form for creating projects via POST /projects.
   * - Adds a Refresh button to manually reload the project list from backend.
   * - On clicking a project card, opens a details section showing the project title and lists 'Tasks' and 'Bugs' from /work-items.
   */
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectKey, setProjectKey] = useState('');
  const [selectedColor, setSelectedColor] = useState(THEME_COLORS[0]);
  const [projectDescription, setProjectDescription] = useState('');

  const [error, setError] = useState('');
  const [listError, setListError] = useState('');
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // UI state for Refresh button

  // Selection and details state
  // Details panel state removed in favor of navigation to /project/:id
  const [selectedProject, setSelectedProject] = useState(null); // kept for minimal change but unused
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState('');
  const [projectTasks, setProjectTasks] = useState([]);
  const [projectBugs, setProjectBugs] = useState([]);

  const apiBase = getApiBaseUrl();

  // Extracted loader to reuse after create and refresh
  const loadProjects = async (signal) => {
    setLoading(true);
    setListError('');
    try {
      const resp = await fetch(buildUrl('/projects'), { method: 'GET', signal });
      if (!resp.ok) {
        const text = await resp.text();
        let data = null;
        try { data = text ? JSON.parse(text) : null; } catch { /* ignore parse issues */ }
        const message = (data && (data.detail || data.message || data.error)) || `Failed to load projects (${resp.status})`;
        throw new Error(message);
      }

      // Prefer JSON parse, but fallback to empty array if needed
      let data = [];
      try {
        data = await resp.json();
      } catch {
        data = [];
      }

      // Normalize to expected fields with safe fallbacks, including bugs/tasks counts.
      // Backend openapi indicates 'bugs' and 'tasks' are integer aggregates. Some backends may instead return arrays.
      const normalized = Array.isArray(data)
        ? data.map((p, idx) => {
            const bugsCount =
              Number.isFinite(p?.bugs)
                ? p.bugs
                : Array.isArray(p?.bugs)
                ? p.bugs.length
                : (Number.isFinite(p?.bugs_count) ? p.bugs_count : 0);

            const tasksCount =
              Number.isFinite(p?.tasks)
                ? p.tasks
                : Array.isArray(p?.tasks)
                ? p.tasks.length
                : (Number.isFinite(p?.tasks_count) ? p.tasks_count : 0);

            return {
              id: p?.id ?? `tmp-${idx}-${Math.random().toString(36).slice(2)}`,
              name: p?.name ?? 'Untitled',
              description: p?.description ?? '',
              project_key: p?.project_key ?? null,
              colour: p?.colour ?? null,
              created_at: p?.created_at ?? null,
              bugs: bugsCount,
              tasks: tasksCount,
            };
          })
        : [];

      setProjects(normalized);
    } catch (err) {
      if (err?.name === 'AbortError' || err?.message?.toLowerCase().includes('aborted')) {
        // ignore aborts
      } else {
        setListError(err?.message || 'Failed to load projects');
        setProjects([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects on mount and when API base URL changes
  useEffect(() => {
    const controller = new AbortController();
    loadProjects(controller.signal);
    return () => {
      controller.abort();
    };
  }, [apiBase]);

  const handleCreateProject = async (e) => {
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

    setSubmitting(true);
    try {
      const payload = {
        name: projectName.trim(),
        project_key: projectKey.trim().toUpperCase(),
        description: projectDescription.trim() || null,
        colour: selectedColor, // hex code
        created_at: new Date().toISOString(),
      };
      await apiPost('/projects', payload);
      // Close modal, reset form, and refresh list
      setShowModal(false);
      resetForm();
      await loadProjects(); // no signal, quick refresh
    } catch (err) {
      setError(err?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setProjectName('');
    setProjectKey('');
    setSelectedColor(THEME_COLORS[0]);
    setProjectDescription('');
    setError('');
  };

  // PUBLIC_INTERFACE
  const handleRefresh = async () => {
    /** Manually refetch the project list from the backend and update the UI. */
    setRefreshing(true);
    try {
      await loadProjects(); // reuse loader; no signal for immediate action
    } finally {
      setRefreshing(false);
    }
  };

  // PUBLIC_INTERFACE
  const handleSelectProject = async (project) => {
    /**
     * Navigate to the dedicated Project Details page.
     */
    if (!project || !project.id) return;
    window.location.assign(`/project/${project.id}`);
  };

  const emptyState = useMemo(() => !loading && projects.length === 0 && !listError, [loading, projects.length, listError]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Projects</h2>
        <div className="dashboard-actions">
          <button
            className="btn btn-secondary refresh-btn"
            onClick={handleRefresh}
            aria-label="Refresh project list"
            disabled={refreshing || loading}
            title="Reload projects"
            type="button"
          >
            {refreshing || loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            className="btn create-project-btn"
            onClick={() => setShowModal(true)}
            aria-label="Create new project"
            type="button"
          >
            Create New Project
          </button>
        </div>
      </div>

      {loading ? (
        <div className="subtitle">Loading projects...</div>
      ) : listError ? (
        <div className="error" role="alert">{listError}</div>
      ) : emptyState ? (
        <div className="subtitle">No projects found. Create your first project to get started.</div>
      ) : (
        <>
          <div className="project-grid">
            {projects.map(project => {
              const borderColor = (typeof project.colour === 'string' && project.colour.trim()) ? project.colour : '#434C5E';
              const createdDate = project.created_at ? new Date(project.created_at).toLocaleDateString() : '—';
              const bugsCount = Number.isFinite(project.bugs) ? project.bugs : 0;
              const tasksCount = Number.isFinite(project.tasks) ? project.tasks : 0;

              return (
                <div
                  key={project.id}
                  className="project-card"
                  style={{ borderColor }}
                  title={project.project_key ? `${project.project_key} • ${project.name}` : project.name}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectProject(project)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectProject(project); } }}
                >
                  <h3>{project.name}</h3>
                  <div className="project-stats">
                    <div className="stat-inline">
                      <span className="stat-label">Created</span>
                      <span className="stat-plain">{createdDate}</span>
                    </div>
                    <div className="stat-row">
                      <div className="stat">
                        <span className="stat-label">Bugs</span>
                        <span className="stat-value">{bugsCount}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Tasks</span>
                        <span className="stat-value">{tasksCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>


        </>
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

            {error && <div className="error" role="alert">{error}</div>}

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
                <label className="label" htmlFor="project-description">Project Description (optional)</label>
                <textarea
                  id="project-description"
                  className="input"
                  rows={3}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Short summary of the project"
                />
              </div>

              <div>
                <label className="label">Project Colour</label>
                <div className="color-picker" role="group" aria-label="Select project colour">
                  {THEME_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Select colour ${color}`}
                      aria-pressed={selectedColor === color}
                    />
                  ))}
                </div>
                <span className="input-hint">Pick a colour to visually identify the project.</span>
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
                <button type="submit" className="btn" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
