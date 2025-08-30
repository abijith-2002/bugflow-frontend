import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getWorkItems } from '../api';
import '../styles/DashboardPage.css';
import { FaAngleLeft } from 'react-icons/fa';

// PUBLIC_INTERFACE
export default function WorkItemDetailPage() {
  /** 
   * Work Item Detail Page
   * - Route params: :projectId and :itemId (numeric id within project).
   * - Loads all work items for the project (GET /work-items?project_id=<projectId>) and finds the one with id === Number(itemId).
   * - Displays a clear details view showing all available fields from the work item.
   */
  const { projectId, itemId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [workItem, setWorkItem] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setErr('');
      try {
        if (!projectId || !itemId) {
          throw new Error('Missing item identifier.');
        }
        const items = await getWorkItems({ projectId });
        const nid = Number(itemId);
        const found = Array.isArray(items) ? items.find(w => Number(w?.id) === nid) : null;
        if (active) {
          setWorkItem(found || null);
        }
      } catch (e) {
        if (active) setErr(e?.message || 'Failed to load work item');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [projectId, itemId]);

  const human = {
    type: (t) => (t === 'bug' ? 'Bug' : 'Task'),
    status: (s) => {
      const x = (s || '').toLowerCase();
      if (x === 'in_progress') return 'In Progress';
      if (x === 'closed') return 'Closed';
      return 'Open';
    },
    priority: (p) => {
      const x = (p || '').toLowerCase();
      if (x === 'low') return 'Low';
      if (x === 'high') return 'High';
      if (x === 'critical') return 'Critical';
      return 'Medium';
    },
    dateTime: (iso) => {
      if (!iso) return '—';
      try {
        const d = new Date(iso);
        return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
      } catch {
        return '—';
      }
    }
  };

  const title = useMemo(() => {
    if (loading) return 'Loading...';
    if (workItem?.item_key) return workItem.item_key;
    return 'Work Item';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, workItem?.item_key]);

  return (
    <div className="dashboard">
      <div className="dashboard-header project-details-header">
        <h2>{title}</h2>
        <div className="dashboard-actions">
          <button
            className="btn btn-secondary back-btn"
            type="button"
            onClick={() => navigate(`/project/${projectId}`)}
            aria-label="Back to Project"
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--action-gap)' }}>
              <FaAngleLeft aria-hidden="true" />
              <span>Back to Project</span>
            </span>
          </button>
        </div>
      </div>

      {err ? <div className="error" role="alert" style={{ marginBottom: 12 }}>{err}</div> : null}
      {loading ? (
        <div className="subtitle">Loading work item...</div>
      ) : !workItem ? (
        <div className="subtitle">Work item not found.</div>
      ) : (
        <div className="project-details" style={{ width: '100%' }}>
          <div className="project-details-header" style={{ borderBottom: 'none', paddingTop: 0 }}>
            <h3 className="project-details-title">Details</h3>
          </div>

          <div className="work-items-table" style={{ overflowX: 'auto', background: 'var(--surface)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '10px', color: 'var(--text-dim)', width: 200 }}>Item Key</th>
                  <td style={{ padding: '10px', fontWeight: 600, color: 'var(--nord8)' }}>{workItem.item_key || '—'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '10px', color: 'var(--text-dim)' }}>Project ID</th>
                  <td style={{ padding: '10px' }}>{workItem.project_id || projectId || '—'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '10px', color: 'var(--text-dim)' }}>Item ID</th>
                  <td style={{ padding: '10px' }}>{workItem.id ?? '—'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '10px', color: 'var(--text-dim)' }}>Type</th>
                  <td style={{ padding: '10px' }}>{human.type(workItem.item_type)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '10px', color: 'var(--text-dim)' }}>Title</th>
                  <td style={{ padding: '10px' }}>{workItem.title || '—'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '10px', color: 'var(--text-dim)' }}>Status</th>
                  <td style={{ padding: '10px' }}>{human.status(workItem.status)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '10px', color: 'var(--text-dim)' }}>Priority</th>
                  <td style={{ padding: '10px' }}>{human.priority(workItem.priority)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '10px', color: 'var(--text-dim)' }}>Created At</th>
                  <td style={{ padding: '10px' }}>{human.dateTime(workItem.created_at)}</td>
                </tr>
                <tr>
                  <th style={{ textAlign: 'left', verticalAlign: 'top', padding: '10px', color: 'var(--text-dim)' }}>Description</th>
                  <td style={{ padding: '10px', whiteSpace: 'pre-wrap' }}>{workItem.description || '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
