import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiGet, getWorkItems, buildUrl } from '../api';
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
    </div>
  );
}
