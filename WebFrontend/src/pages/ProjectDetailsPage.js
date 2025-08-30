import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiGet, getWorkItems, buildUrl, createWorkItem } from '../api';
import '../styles/DashboardPage.css'; // reuse existing styles for lists/cards
import { FaAngleLeft, FaPlus } from 'react-icons/fa';

// PUBLIC_INTERFACE
export default function ProjectDetailsPage() {
  /** 
   * Project Details Page
   * - Reads :id from URL.
   * - Fetches the project (GET /projects) and filters to id locally (since backend has only list endpoint).
   * - On mount, fetches all work items for this project via GET /work-items?project_id=<id>.
   * - Displays project title as heading and a unified table of all work items with filters.
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

  // Filters UI state
  const [filterType, setFilterType] = useState('all'); // 'all' | 'bug' | 'task'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'open' | 'in_progress' | 'closed'
  const [filterPriority, setFilterPriority] = useState('all'); // 'all' | 'low' | 'medium' | 'high' | 'critical'

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

  // Combine tasks and bugs in a single array
  const allItems = useMemo(() => {
    const taggedTasks = tasks.map(t => ({ ...t, _type: 'task' }));
    const taggedBugs = bugs.map(b => ({ ...b, _type: 'bug' }));
    // Sort newest first by created_at if available
    const merged = [...taggedTasks, ...taggedBugs].sort((a, b) => {
      const da = a?.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b?.created_at ? new Date(b.created_at).getTime() : 0;
      return db - da;
    });
    return merged;
  }, [tasks, bugs]);

  // Apply filters
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      if (filterType !== 'all' && item._type !== filterType) return false;
      if (filterStatus !== 'all') {
        const s = (item.status || '').toLowerCase();
        const want = filterStatus;
        if (s !== want) return false;
      }
      if (filterPriority !== 'all') {
        const p = (item.priority || '').toLowerCase();
        const wantp = filterPriority;
        if (p !== wantp) return false;
      }
      return true;
    });
  }, [allItems, filterType, filterStatus, filterPriority]);

  // Helper to humanize type/status/priority and created date
  const humanType = (t) => (t === 'bug' ? 'Bug' : 'Task');
  const humanStatus = (s) => {
    const x = (s || '').toLowerCase();
    if (x === 'in_progress') return 'In Progress';
    if (x === 'closed') return 'Closed';
    return 'Open';
  };
  const humanPriority = (p) => {
    const x = (p || '').toLowerCase();
    if (x === 'low') return 'Low';
    if (x === 'high') return 'High';
    if (x === 'critical') return 'Critical';
    return 'Medium';
  };
  const humanDateTime = (iso) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    } catch {
      return '—';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header project-details-header">
        <h2>{heading}</h2>
        <div className="dashboard-actions">
          <button className="btn btn-secondary back-btn" type="button" onClick={() => navigate('/dashboard')} aria-label="Go back to dashboard">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--action-gap)' }}>
              <FaAngleLeft aria-hidden="true" />
              <span>Back</span>
            </span>
          </button>
          <button
            className="btn create-item-btn"
            type="button"
            onClick={() => { setShowCreateModal(true); setCreateError(''); }}
            aria-label="Create new work item"
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--action-gap)', whiteSpace: 'nowrap' }}>
              <FaPlus aria-hidden="true" />
              <span>Create Item</span>
            </span>
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
        <div className="project-details" style={{ width: '100%' }}>
          <div className="project-details-header" style={{ borderBottom: 'none', paddingTop: 0 }}>
            <h3 className="project-details-title">Items</h3>
          </div>

          {/* Filters Row */}
          <div className="row" style={{ gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="label" htmlFor="filter-type">Item Type</label>
              <select
                id="filter-type"
                className="input"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All</option>
                <option value="bug">Bug</option>
                <option value="task">Task</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="label" htmlFor="filter-status">Status</label>
              <select
                id="filter-status"
                className="input"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="label" htmlFor="filter-priority">Priority</label>
              <select
                id="filter-priority"
                className="input"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="all">All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Unified Table */}
          <div className="work-items-table" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-alt)' }}>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid var(--border)', color: 'var(--text-dim)' }}>Item Key</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid var(--border)', color: 'var(--text-dim)' }}>Item Type</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid var(--border)', color: 'var(--text-dim)' }}>Title</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid var(--border)', color: 'var(--text-dim)' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid var(--border)', color: 'var(--text-dim)' }}>Priority</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid var(--border)', color: 'var(--text-dim)' }}>Created on</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 12, color: 'var(--text-dimmer)' }}>
                      No items match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr
                      key={item.item_key}
                      style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                      role="button"
                      tabIndex={0}
                      title={`Open ${item.item_key}`}
                      onClick={() => navigate(`/project/${item.project_id}/item/${item.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/project/${item.project_id}/item/${item.id}`);
                        }
                      }}
                    >
                      <td style={{ padding: '10px', color: 'var(--nord8)', fontWeight: 600, textDecoration: 'underline' }}>{item.item_key}</td>
                      <td style={{ padding: '10px' }}>{humanType(item._type)}</td>
                      <td style={{ padding: '10px' }}>{item.title || '—'}</td>
                      <td style={{ padding: '10px', color: 'var(--text-dim)' }}>{humanStatus(item.status)}</td>
                      <td style={{ padding: '10px' }}>{humanPriority(item.priority)}</td>
                      <td style={{ padding: '10px' }}>{humanDateTime(item.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
