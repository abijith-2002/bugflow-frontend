import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getWorkItems } from '../api';
import '../styles/DashboardPage.css';
import { FaAngleLeft } from 'react-icons/fa';

// PUBLIC_INTERFACE
export default function WorkItemDetailPage() {
  /** 
   * Work Item Detail Page
   * - Route params: :projectId and :itemId.
   * - Loads the item from GET /work-items?project_id and finds by id.
   * - Focused layout: Only work item details are shown. No project-level sections.
   * - Two-column content area:
   *     Left: Description
   *     Right: Type, Status, Priority, Created-on
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
        background: isBug ? 'rgba(191,97,106,0.15)' : 'rgba(143,188,187,0.15)',
        color: isBug ? '#BF616A' : '#8FBCBB',
        borderColor: isBug ? 'rgba(191,97,106,0.45)' : 'rgba(143,188,187,0.45)',
      };
    },
    status: (status) => {
      const s = (status || '').toLowerCase();
      if (s === 'closed') {
        return {
          background: 'rgba(163,190,140,0.15)',
          color: '#A3BE8C',
          borderColor: 'rgba(163,190,140,0.45)',
        };
      }
      if (s === 'in_progress') {
        return {
          background: 'rgba(235,203,139,0.15)',
          color: '#EBCB8B',
          borderColor: 'rgba(235,203,139,0.45)',
        };
      }
      return {
        background: 'rgba(129,161,193,0.15)',
        color: '#81A1C1',
        borderColor: 'rgba(129,161,193,0.45)',
      };
    },
    priority: (priority) => {
      const p = (priority || '').toLowerCase();
      if (p === 'critical') {
        return {
          background: 'rgba(191,97,106,0.15)',
          color: '#BF616A',
          borderColor: 'rgba(191,97,106,0.45)',
        };
      }
      if (p === 'high') {
        return {
          background: 'rgba(208,135,112,0.15)',
          color: '#D08770',
          borderColor: 'rgba(208,135,112,0.45)',
        };
      }
      if (p === 'low') {
        return {
          background: 'rgba(180,142,173,0.15)',
          color: '#B48EAD',
          borderColor: 'rgba(180,142,173,0.45)',
        };
      }
      return {
        background: 'rgba(136,192,208,0.15)',
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
        {/* Only work item info in the header; no project summary */}
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

        {/* Keep a simple back link, but do not render any project details */}
        <div className="dashboard-actions" style={{ flexWrap: 'wrap' }}>
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
        <div
          className="project-details"
          style={{
            width: '100%',
            background: 'transparent' /* ensure no background color */,
          }}
        >
          {/* Two-column content area with only work item fields */}
          <div
            className="wi-two-col"
            style={{
              display: 'grid',
              gridTemplateColumns: '4fr 1fr',
              gap: 16,
              alignItems: 'start'
            }}
          >
            {/* Left: Description only */}
            <div>
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

            {/* Right: Tags and Created-on */}
            <aside
              style={{
                borderLeft: '1px solid var(--border)',
                paddingLeft: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
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
              </div>

              <div style={{ marginTop: 4 }}>
                <div className="label" style={{ marginBottom: 4 }}>Created on</div>
                <div style={{ color: 'var(--text)' }}>{human.dateTime(workItem.created_at)}</div>
              </div>
            </aside>
          </div>

          {/* Responsive: collapse to single column on small screens */}
          <style>
            {`
              @media (max-width: 860px) {
                .wi-two-col {
                  display: block;
                }
                .wi-two-col > aside {
                  border-left: none !important;
                  padding-left: 0 !important;
                  margin-top: 12px;
                  border-top: 1px solid var(--border);
                  padding-top: 12px;
                }
              }
            `}
          </style>
        </div>
      )}
    </div>
  );
}
