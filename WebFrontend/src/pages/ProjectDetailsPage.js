import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiGet, getWorkItems, buildUrl, createWorkItem } from '../api';
import '../styles/DashboardPage.css'; // reuse existing styles for lists/cards

// PUBLIC_INTERFACE
export default function ProjectDetailsPage() {
  /** 
   * Project Details Page
   * - Reads :id from URL.
   * - Fetches the project (GET /projects) and filters to id locally (since backend has only list endpoint).
   * - On mount, fetches all work items for this project via GET /work-items?project_id=<id>.
   * - Displays project title as heading and grouped lists of Tasks and Bugs.
   */
  const { id } = useParams();
  const navigate = useNavigate();

  const [loadingProject, setLoadingProject] = useState(true);
  const [projectErr, setProjectErr] = useState('');
  const [project, setProject] = useState(null);

  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsErr, setItemsErr] = useState('');
  const [tasks, setTasks] = useState([]);
  const [bugs, setBugs] = useState([]);

  // Create Item modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  const [formType, setFormType] = useState('task'); // 'task' | 'bug'
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState('open'); // 'open' | 'in_progress' | 'closed'
  const [formPriority, setFormPriority] = useState('medium'); // 'low' | 'medium' | 'high' | 'critical'

  // Load project list and pick the one with matching id.
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function loadProject() {
      setLoadingProject(true);
      setProjectErr('');
      try {
        const resp = await fetch(buildUrl('/projects'), { method: 'GET', signal: controller.signal });
        if (!resp.ok) {
          const text = await resp.text();
          let data = null;
          try { data = text ? JSON.parse(text) : null; } catch { /* ignore */ }
          const message = (data && (data.detail || data.message || data.error)) || `Failed to load projects (${resp.status})`;
          throw new Error(message);
        }
        const arr = await resp.json();
        const found = Array.isArray(arr) ? arr.find(p => p?.id === id) : null;
        if (mounted) {
          setProject(found || null);
        }
      } catch (err) {
        if (mounted) {
          if (err?.name !== 'AbortError') setProjectErr(err?.message || 'Failed to load project');
        }
      } finally {
        if (mounted) setLoadingProject(false);
      }
    }

    if (id) loadProject();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [id]);

  // UTIL: refresh items (used after create)
  const refreshItems = async () => {
    setItemsLoading(true);
    setItemsErr('');
    try {
      const items = await getWorkItems({ projectId: id });
      const t = [];
      const b = [];
      if (Array.isArray(items)) {
        for (const wi of items) {
          if (wi?.item_type === 'task') t.push(wi);
          else if (wi?.item_type === 'bug') b.push(wi);
        }
      }
      setTasks(t);
      setBugs(b);
    } catch (err) {
      setItemsErr(err?.message || 'Failed to load work items');
    } finally {
      setItemsLoading(false);
    }
  };

  const resetCreateForm = () => {
    setFormType('task');
    setFormTitle('');
    setFormDesc('');
    setFormStatus('open');
    setFormPriority('medium');
    setCreateError('');
  };

  const onSubmitCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    if (!formTitle.trim()) {
      setCreateError('Title is required.');
      return;
    }
    if (!id) {
      setCreateError('Project id missing.');
      return;
    }
    setCreating(true);
    try {
      // Map UI values to backend-expected enums
      const statusMap = {
        Open: 'open',
        'In Progress': 'in_progress',
        Closed: 'closed',
        open: 'open',
        in_progress: 'in_progress',
        closed: 'closed',
      };
      const priorityMap = {
        Low: 'low',
        Medium: 'medium',
        High: 'high',
        Critical: 'critical',
        low: 'low',
        medium: 'medium',
        high: 'high',
        critical: 'critical',
      };

      await createWorkItem({
        project_id: id,
        item_type: formType === 'bug' ? 'bug' : 'task',
        title: formTitle.trim(),
        description: formDesc.trim() || null,
        status: statusMap[formStatus] || 'open',
        priority: priorityMap[formPriority] || 'medium',
      });

      setShowCreateModal(false);
      resetCreateForm();
      await refreshItems();
    } catch (err) {
      setCreateError(err?.message || 'Failed to create item');
    } finally {
      setCreating(false);
    }
  };

  // Load work items for the project
  useEffect(() => {
    let active = true;
    async function loadItems() {
      setItemsLoading(true);
      setItemsErr('');
      setTasks([]);
      setBugs([]);
      try {
        const items = await getWorkItems({ projectId: id });
        const t = [];
        const b = [];
        if (Array.isArray(items)) {
          for (const wi of items) {
            if (wi?.item_type === 'task') t.push(wi);
            else if (wi?.item_type === 'bug') b.push(wi);
          }
        }
        if (active) {
          setTasks(t);
          setBugs(b);
        }
      } catch (err) {
        if (active) setItemsErr(err?.message || 'Failed to load work items');
      } finally {
        if (active) setItemsLoading(false);
      }
    }
    if (id) loadItems();
    return () => { active = false; };
  }, [id]);

  const heading = useMemo(() => {
    if (loadingProject) return 'Loading...';
    if (project && project.name) return project.name;
    return 'Project';
  }, [loadingProject, project]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>{heading}</h2>
        <div className="dashboard-actions">
          <button className="btn btn-secondary" type="button" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => { setShowCreateModal(true); setCreateError(''); }}
            aria-label="Create new work item"
          >
            Create Item
          </button>
        </div>
      </div>

      {projectErr ? <div className="error" role="alert" style={{ marginBottom: 16 }}>{projectErr}</div> : null}
      {!loadingProject && !project ? (
        <div className="subtitle">Project not found.</div>
      ) : null}

      {itemsLoading ? (
        <div className="subtitle">Loading items...</div>
      ) : itemsErr ? (
        <div className="error" role="alert">{itemsErr}</div>
      ) : (
        <div className="project-items">
          <div className="items-group">
            <h4 className="items-title">Tasks</h4>
            {tasks.length === 0 ? (
              <div className="subtitle">No tasks found.</div>
            ) : (
              <ul className="items-list">
                {tasks.map(item => (
                  <li key={item.item_key} className="item-row">
                    <span className="item-key">{item.item_key}</span>
                    <span className="item-title">{item.title}</span>
                    {item.status ? <span className="item-status">{item.status}</span> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="items-group">
            <h4 className="items-title">Bugs</h4>
            {bugs.length === 0 ? (
              <div className="subtitle">No bugs found.</div>
            ) : (
              <ul className="items-list">
                {bugs.map(item => (
                  <li key={item.item_key} className="item-row">
                    <span className="item-key">{item.item_key}</span>
                    <span className="item-title">{item.title}</span>
                    {item.status ? <span className="item-status">{item.status}</span> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-backdrop" role="presentation">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-item-title"
          >
            <h2 id="create-item-title" className="modal-title">Create Work Item</h2>
            <p className="modal-subtitle">Add a new Task or Bug for this project.</p>

            {createError ? <div className="error" role="alert">{createError}</div> : null}

            <form className="form" onSubmit={onSubmitCreate}>
              <div className="row">
                <div style={{ flex: 1 }}>
                  <label className="label" htmlFor="item-type">Type</label>
                  <select
                    id="item-type"
                    className="input"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                  >
                    <option value="task">Task</option>
                    <option value="bug">Bug</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label" htmlFor="item-status">Status</label>
                  <select
                    id="item-status"
                    className="input"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div style={{ flex: 1 }}>
                  <label className="label" htmlFor="item-priority">Priority</label>
                  <select
                    id="item-priority"
                    className="input"
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="item-title">Title</label>
                <input
                  id="item-title"
                  className="input"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Short title"
                  required
                />
              </div>

              <div>
                <label className="label" htmlFor="item-desc">Description</label>
                <textarea
                  id="item-desc"
                  className="input"
                  rows={4}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Describe the task or bug"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setShowCreateModal(false); resetCreateForm(); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
