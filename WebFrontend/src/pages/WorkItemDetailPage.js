import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getWorkItems,
  updateWorkItemStatus,
  apiDelete,
  apiPatch,
  getWorkItemComments,
  addWorkItemComment
} from '../api';
import '../styles/DashboardPage.css';
import { FaAngleLeft } from 'react-icons/fa';

/**
 * PUBLIC_INTERFACE
 */
export default function WorkItemDetailPage() {
  /**
   * Work Item Detail Page
   * - Route params: :projectId and :itemId.
   * - Loads the item from GET /work-items?project_id and finds by id.
   * - Title and Description are inline editable: click to edit, Enter/blur saves, Escape cancels.
   * - Two-column content area:
   *     Left: Title + Description + Comments
   *     Right: Type, Status, Priority, Created-on
   */
  const { projectId, itemId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [workItem, setWorkItem] = useState(null);

  // Status update state
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState('');

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Inline edit states
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [descDraft, setDescDraft] = useState('');
  const [fieldSaving, setFieldSaving] = useState(null); // 'title' | 'description' | null
  const [fieldError, setFieldError] = useState('');     // error message for title/description save
  const titleInputRef = useRef(null);
  const descTextareaRef = useRef(null);

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  // Load work item (from project items list)
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
          setTitleDraft(found?.title || '');
          setDescDraft(found?.description || '');
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

  // Focus input/textarea on entering edit mode
  useEffect(() => {
    if (editingTitle) {
      setTimeout(() => titleInputRef.current?.focus(), 0);
    }
  }, [editingTitle]);
  useEffect(() => {
    if (editingDesc) {
      setTimeout(() => descTextareaRef.current?.focus(), 0);
    }
  }, [editingDesc]);

  // Load comments when workItem is available
  useEffect(() => {
    let mounted = true;
    async function loadComments() {
      if (!workItem?.project_id || workItem?.id === undefined || workItem?.id === null) return;
      setCommentsLoading(true);
      setCommentsError('');
      try {
        const data = await getWorkItemComments({ project_id: workItem.project_id, id: workItem.id });
        if (mounted) setComments(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setCommentsError(e?.message || 'Failed to load comments');
      } finally {
        if (mounted) setCommentsLoading(false);
      }
    }
    loadComments();
    return () => { mounted = false; };
  }, [workItem?.project_id, workItem?.id]);

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

  // PUBLIC_INTERFACE
  const onChangeStatus = async (e) => {
    /** Update the work item status via backend PATCH and reflect it locally. */
    const next = e.target.value; // 'open' | 'in_progress' | 'closed'
    if (!workItem) return;
    setStatusError('');
    setStatusSaving(true);
    try {
      const updated = await updateWorkItemStatus({
        project_id: workItem.project_id,
        id: workItem.id,
        status: next,
      });
      setWorkItem((prev) => ({ ...(prev || {}), ...(updated || {}), status: (updated?.status ?? next) }));
    } catch (patchErr) {
      setStatusError(patchErr?.message || 'Failed to update status');
    } finally {
      setStatusSaving(false);
    }
  };

  // Helpers for PATCHing a field
  const patchField = async (fieldName, value) => {
    if (!workItem) return null;
    // Assuming backend supports generic field patch at /work-items/{project_id}/{id}
    const body = { [fieldName]: value };
    return apiPatch(`/work-items/${workItem.project_id}/${workItem.id}`, body);
  };

  // Save title (on blur or Enter)
  const saveTitle = async () => {
    if (!workItem) return;
    const trimmed = (titleDraft || '').trim();
    if (!trimmed) {
      // Restore to previous if emptied
      setTitleDraft(workItem.title || '');
      setEditingTitle(false);
      return;
    }
    if (trimmed === workItem.title) {
      setEditingTitle(false);
      return;
    }
    setFieldError('');
    setFieldSaving('title');
    try {
      const updated = await patchField('title', trimmed);
      setWorkItem((prev) => ({ ...(prev || {}), ...(updated || {}), title: updated?.title ?? trimmed }));
      setEditingTitle(false);
    } catch (e) {
      setFieldError(e?.message || 'Failed to save title');
      // keep editing mode to allow correction
    } finally {
      setFieldSaving(null);
    }
  };

  // Save description (on blur or Enter)
  const saveDesc = async () => {
    if (!workItem) return;
    const normalized = (descDraft || '').trim();
    if ((workItem.description || '') === normalized) {
      setEditingDesc(false);
      return;
    }
    setFieldError('');
    setFieldSaving('description');
    try {
      const updated = await patchField('description', normalized || null);
      setWorkItem((prev) => ({ ...(prev || {}), ...(updated || {}), description: updated?.description ?? (normalized || null) }));
      setEditingDesc(false);
    } catch (e) {
      setFieldError(e?.message || 'Failed to save description');
    } finally {
      setFieldSaving(null);
    }
  };

  // Key handlers
  const onTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Save on Enter
      saveTitle();
    } else if (e.key === 'Escape') {
      // Undo changes
      setTitleDraft(workItem?.title || '');
      setEditingTitle(false);
      setFieldError('');
    }
  };

  const onDescKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      // Ctrl/Cmd+Enter to save multiline, preserving Enter for newlines
      e.preventDefault();
      saveDesc();
    } else if (e.key === 'Escape') {
      setDescDraft(workItem?.description || '');
      setEditingDesc(false);
      setFieldError('');
    }
  };

  // PUBLIC_INTERFACE
  const onConfirmDelete = async () => {
    /** Deletes the current work item by calling DELETE /work-items/{project_id}/{id} and navigates back to project page. */
    if (!workItem) return;
    setDeleteError('');
    setDeleting(true);
    try {
      await apiDelete(`/work-items/${workItem.project_id}/${workItem.id}`);
      navigate(`/project/${workItem.project_id}`, { replace: true });
    } catch (errDel) {
      setDeleteError(errDel?.message || 'Failed to delete work item');
    } finally {
      setDeleting(false);
    }
  };

  // PUBLIC_INTERFACE
  const submitNewComment = async (e) => {
    /** Post a new comment to the backend and update the local list on success.
     * Requirement: author_display_name MUST come only from localStorage -> bugflow.auth.user.displayName.
     * Do not derive from session/context/API here. Fallback to 'Anonymous' when missing.
     */
    e.preventDefault?.();
    if (!workItem) return;
    const trimmed = (newComment || '').trim();
    if (!trimmed) return;

    setPostingComment(true);
    setCommentsError('');

    try {
      // Strictly read display name from localStorage via getDisplayName helper.
      // This reads the saved user object (bugflow.auth.user) and returns its displayName or null.
      const { getDisplayName } = await import('../auth');
      const localDisplayName = typeof getDisplayName === 'function' ? getDisplayName() : null;

      // Apply hard fallback if missing/empty.
      const authorDisplayName =
        localDisplayName && String(localDisplayName).trim()
          ? String(localDisplayName).trim()
          : 'Anonymous';

      const created = await addWorkItemComment({
        project_id: workItem.project_id,
        id: workItem.id,
        body: trimmed,
        // Intentionally do not send/derive author_id here; only author_display_name from localStorage per requirement.
        author_display_name: authorDisplayName,
      });

      if (created && typeof created === 'object') {
        setComments((prev) => [...prev, created]);
      } else {
        const list = await getWorkItemComments({ project_id: workItem.project_id, id: workItem.id });
        setComments(Array.isArray(list) ? list : []);
      }
      setNewComment('');
    } catch (e2) {
      setCommentsError(e2?.message || 'Failed to add comment');
    } finally {
      setPostingComment(false);
    }
  };

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

          {/* Inline editable title */}
          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
            {!editingTitle ? (
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  cursor: 'text',
                }}
                title="Click to edit title"
                onClick={() => {
                  setFieldError('');
                  setTitleDraft(workItem?.title || '');
                  setEditingTitle(true);
                }}
              >
                {pageTitle}
              </h2>
            ) : (
              <input
                ref={titleInputRef}
                className="input"
                type="text"
                aria-label="Edit title"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={onTitleKeyDown}
                disabled={fieldSaving === 'title'}
                style={{ maxWidth: 520, paddingTop: 8, paddingBottom: 8 }}
              />
            )}
          </div>
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
          <button
            className="btn"
            type="button"
            onClick={() => { setShowDeleteConfirm(true); setDeleteError(''); }}
            aria-label="Delete this work item"
            style={{ background: 'var(--nord11)', borderColor: 'var(--nord11)' }}
            disabled={!workItem}
          >
            Delete
          </button>
        </div>
      </div>

      {err ? <div className="error" role="alert" style={{ marginBottom: 12 }}>{err}</div> : null}
      {fieldError ? <div className="error" role="alert" style={{ marginBottom: 12 }}>{fieldError}</div> : null}

      {loading ? (
        <div className="subtitle">Loading work item...</div>
      ) : !workItem ? (
        <div className="subtitle">Work item not found.</div>
      ) : (
        <div
          className="project-details"
          style={{
            width: '100%',
            background: 'transparent',
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
            {/* Left: Title (already in header) and editable Description */}
            <div>
              <div className="label" style={{ marginBottom: 6 }}>Description</div>
              {!editingDesc ? (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setFieldError('');
                    setDescDraft(workItem?.description || '');
                    setEditingDesc(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setFieldError('');
                      setDescDraft(workItem?.description || '');
                      setEditingDesc(true);
                    }
                  }}
                  title="Click to edit description"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    whiteSpace: 'pre-wrap',
                    color: 'var(--text)',
                    cursor: 'text',
                    minHeight: 24,
                  }}
                >
                  {workItem.description || '—'}
                </div>
              ) : (
                <textarea
                  ref={descTextareaRef}
                  className="input"
                  rows={6}
                  aria-label="Edit description"
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                  onBlur={saveDesc}
                  onKeyDown={onDescKeyDown}
                  disabled={fieldSaving === 'description'}
                  placeholder="Add more details..."
                  style={{ width: '100%' }}
                />
              )}

              {/* Comments Section */}
              <div style={{ marginTop: 20 }}>
                <div className="label" style={{ marginBottom: 6 }}>Comments</div>

                {/* Existing comments */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    marginBottom: 10
                  }}
                >
                  {commentsLoading ? (
                    <div className="subtitle">Loading comments...</div>
                  ) : commentsError ? (
                    <div className="error" role="alert">{commentsError}</div>
                  ) : comments.length === 0 ? (
                    <div className="subtitle" style={{ color: 'var(--text-dimmer)' }}>
                      No comments yet. Be the first to comment.
                    </div>
                  ) : (
                    comments.map((c, idx) => {
                      const created = (() => {
                        try {
                          return c?.created_at ? new Date(c.created_at).toLocaleString() : null;
                        } catch {
                          return null;
                        }
                      })();
                      return (
                        <div
                          key={`${c?.id ?? idx}-${c?.created_at ?? 't'}`}
                          style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 8,
                            padding: '10px 12px',
                            display: 'grid',
                            gap: 6,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                            <span style={{ fontWeight: 600, color: 'var(--nord8)' }}>
                              {(() => {
                                // Determine display name with priority:
                                // 1) author_display_name (non-empty string)
                                // 2) author_id (string; display first 8 chars for brevity)
                                // 3) 'Anonymous' fallback
                                const name = (c?.author_display_name ?? '').toString().trim();
                                if (name) return name;
                                const aid = c?.author_id ? String(c.author_id).trim() : '';
                                if (aid) return aid.slice(0, 8);
                                return 'Anonymous';
                              })()}
                            </span>
                            <span className="subtitle" style={{ margin: 0 }}>
                              {created ? created : ''}
                            </span>
                          </div>
                          <div style={{ whiteSpace: 'pre-wrap' }}>
                            {c?.body || ''}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add comment form */}
                <form onSubmit={submitNewComment} className="form" style={{ marginTop: 8 }}>
                  <div>
                    <label className="label" htmlFor="new-comment">Add a comment</label>
                    <textarea
                      id="new-comment"
                      className="input"
                      rows={3}
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      disabled={postingComment}
                      required
                    />
                  </div>
                  <div className="row" style={{ justifyContent: 'flex-end' }}>
                    <button
                      className="btn"
                      type="submit"
                      disabled={postingComment || !newComment.trim()}
                      title="Post comment"
                      style={{ width: 'auto' }}
                    >
                      {postingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right: Tags, Status control and Created-on */}
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

              {/* Status control */}
              <div>
                <label className="label" htmlFor="wi-status">Change status</label>
                <select
                  id="wi-status"
                  className="input"
                  value={(workItem?.status || 'open').toLowerCase()}
                  onChange={onChangeStatus}
                  disabled={statusSaving}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
                {statusError ? <div className="error" role="alert" style={{ marginTop: 8 }}>{statusError}</div> : null}
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

      {showDeleteConfirm && (
        <div className="modal-backdrop" role="presentation">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-item-title"
          >
            <h2 id="delete-item-title" className="modal-title">Delete Work Item</h2>
            <p className="modal-subtitle">
              Are you sure you want to delete <span className="code">{workItem?.item_key || 'this item'}</span>? This action cannot be undone.
            </p>
            {deleteError ? <div className="error" role="alert">{deleteError}</div> : null}
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                onClick={onConfirmDelete}
                disabled={deleting}
                style={{ background: 'var(--nord11)', borderColor: 'var(--nord11)' }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
