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
   * - Displays a details view with a title row: [KEY box][Title] and right-aligned colored tags for type, status, priority.
   * - Shows description below the title row in the content area.
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

  // Tag color helpers for clear differentiation
  const tagStyles = {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 8px',
      borderRadius: 999,
      border: '1px solid var(--border)',
      fontSize: 12,
      fontWeight: 600,
      whiteSpace: 'nowrap',
    },
    type: (type) => {
      const isBug = (type || '').toLowerCase() === 'bug';
      return {
        background: isBug ? 'rgba(191,97,106,0.15)' : 'rgba(143,188,187,0.15)', // red-ish for bug, green/teal for task
        color: isBug ? '#BF616A' : '#8FBCBB',
        borderColor: isBug ? 'rgba(191,97,106,0.45)' : 'rgba(143,188,187,0.45)',
      };
    },
    status: (status) => {
      const s = (status || '').toLowerCase();
      if (s === 'closed') {
        return {
          background: 'rgba(163,190,140,0.15)', // green
          color: '#A3BE8C',
          borderColor: 'rgba(163,190,140,0.45)',
        };
      }
      if (s === 'in_progress') {
        return {
          background: 'rgba(235,203,139,0.15)', // amber
          color: '#EBCB8B',
          borderColor: 'rgba(235,203,139,0.45)',
        };
      }
      return {
        background: 'rgba(129,161,193,0.15)', // blue
        color: '#81A1C1',
        borderColor: 'rgba(129,161,193,0.45)',
      };
    },
    priority: (priority) => {
      const p = (priority || '').toLowerCase();
      if (p === 'critical') {
        return {
          background: 'rgba(191,97,106,0.15)', // red
          color: '#BF616A',
          borderColor: 'rgba(191,97,106,0.45)',
        };
      }
      if (p === 'high') {
        return {
          background: 'rgba(208,135,112,0.15)', // orange
          color: '#D08770',
          borderColor: 'rgba(208,135,112,0.45)',
        };
      }
      if (p === 'low') {
        return {
          background: 'rgba(180,142,173,0.15)', // purple
          color: '#B48EAD',
          borderColor: 'rgba(180,142,173,0.45)',
        };
      }
      return {
        background: 'rgba(136,192,208,0.15)', // teal/blue for medium
        color: '#88C0D0',
        borderColor: 'rgba(136,192,208,0.45)',
      };
    },
  };

  const pageTitle = useMemo(() => {
    if (loading) return 'Loading...';
    return workItem?.title || 'Work Item';
  }, [loading, workItem?.title]);

  const itemKey = workItem?.item_key || '—';

  return (
    <div className="dashboard">
      <div className="dashboard-header project-details-header">
        {/* Title row with key box + title on left, tags on right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', minWidth: 0 }}>
          <div
            title={itemKey}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'var(--surface-alt)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '6px 10px',
              fontWeight: 700,
              color: 'var(--nord8)',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}
          >
            {itemKey}
          </div>
          <h2 style={{ margin: 0, fontSize: 20, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {pageTitle}
          </h2>
        </div>

        <div className="dashboard-actions" style={{ flexWrap: 'wrap' }}>
          {/* Right aligned colored tags */}
          {!loading && workItem ? (
            <>
              <span
                style={{ ...tagStyles.base, ...tagStyles.type(workItem.item_type) }}
                title={`Type: ${human.type(workItem.item_type)}`}
              >
                {human.type(workItem.item_type)}
              </span>
              <span
                style={{ ...tagStyles.base, ...tagStyles.status(workItem.status) }}
                title={`Status: ${human.status(workItem.status)}`}
              >
                {human.status(workItem.status)}
              </span>
              <span
                style={{ ...tagStyles.base, ...tagStyles.priority(workItem.priority) }}
                title={`Priority: ${human.priority(workItem.priority)}`}
              >
                {human.priority(workItem.priority)}
              </span>
            </>
          ) : null}

          {/* Back button */}
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
          {/* Description below the title area */}
          <div style={{ marginBottom: 14 }}>
            <div className="label" style={{ marginBottom: 6 }}>Description</div>
            <div
              style={{
                background: 'var(--surface-alt)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: 12,
                whiteSpace: 'pre-wrap',
                color: 'var(--text)',
              }}
            >
              {workItem.description || '—'}
            </div>
          </div>

          {/* Meta details grid/table */}
          <div className="work-items-table" style={{ overflowX: 'auto', background: 'var(--surface)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '10px', color: 'var(--text-dim)', width: 200 }}>Item Key</th>
                  <td style={{ padding: '10px', fontWeight: 600, color: 'var(--nord8)' }}>{itemKey}</td>
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
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
