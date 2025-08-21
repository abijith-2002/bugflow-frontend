import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bugsApi, commentsApi } from '../services/api';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  MessageSquare, 
  Send,
  Calendar,
  User,
  AlertTriangle
} from 'lucide-react';

// PUBLIC_INTERFACE
const BugDetail = () => {
  /**
   * Bug detail page component for viewing and managing individual bugs
   * @returns {JSX.Element} Bug detail page
   */
  const { bugId } = useParams();
  const navigate = useNavigate();
  
  const [bug, setBug] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchBugDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bugsApi.getBug(bugId);
      setBug(data);
    } catch (err) {
      setError('Failed to load bug details');
      console.error('Bug detail error:', err);
    } finally {
      setLoading(false);
    }
  }, [bugId]);

  const fetchComments = useCallback(async () => {
    try {
      const data = await commentsApi.getComments(bugId);
      setComments(data);
    } catch (err) {
      console.error('Comments error:', err);
    }
  }, [bugId]);

  useEffect(() => {
    if (bugId) {
      fetchBugDetails();
      fetchComments();
    }
  }, [bugId, fetchBugDetails, fetchComments]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      await commentsApi.addComment(bugId, newComment.trim());
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error('Add comment error:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      open: 'badge-open',
      in_progress: 'badge-in-progress',
      resolved: 'badge-resolved',
      closed: 'badge-closed'
    };
    return `badge ${classes[status] || 'badge-open'}`;
  };

  const getPriorityBadgeClass = (priority) => {
    const classes = {
      low: 'badge-low',
      medium: 'badge-medium',
      high: 'badge-high',
      critical: 'badge-critical'
    };
    return `badge ${classes[priority] || 'badge-medium'}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !bug) {
    return (
      <div className="text-center py-8">
        <p className="text-error mb-4">{error || 'Bug not found'}</p>
        <button 
          onClick={() => navigate('/bugs')}
          className="btn btn-primary"
        >
          Back to Bugs
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/bugs')}
            className="btn-icon hover:bg-tertiary"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold mb-2 text-primary">{bug.title}</h1>
            <div className="flex items-center gap-3">
              <span className={getPriorityBadgeClass(bug.priority)}>
                {bug.priority}
              </span>
              <span className={getStatusBadgeClass(bug.status)}>
                {bug.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <Edit size={16} />
            Edit
          </button>
          <button className="btn btn-danger">
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Bug Description */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <div className="prose text-secondary">
              {bug.description.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3">{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare size={20} />
              <h2 className="text-xl font-semibold">
                Comments ({comments.length})
              </h2>
            </div>

            {/* Add Comment */}
            <form onSubmit={handleAddComment} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="input textarea mb-3"
                rows={3}
              />
              <button 
                type="submit"
                disabled={!newComment.trim() || submittingComment}
                className="btn btn-primary flex items-center gap-2"
              >
                {submittingComment ? (
                  <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                ) : (
                  <Send size={16} />
                )}
                Add Comment
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="border border-subtle rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-muted" />
                        <span className="font-medium">{comment.user?.email}</span>
                      </div>
                      <span className="text-xs text-muted">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-secondary">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted text-center py-4">No comments yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Bug Info */}
          <div className="card">
            <h3 className="font-semibold mb-4 text-primary">Bug Information</h3>
            <div className="space-y-4">
              <div className="border-b border-subtle pb-3">
                <label className="text-sm text-muted font-medium">Reporter</label>
                <div className="flex items-center gap-2 mt-1">
                  <User size={16} className="text-muted" />
                  <span className="text-secondary">{bug.reported_by?.email}</span>
                </div>
              </div>

              {bug.assigned_to && (
                <div className="border-b border-subtle pb-3">
                  <label className="text-sm text-muted font-medium">Assignee</label>
                  <div className="flex items-center gap-2 mt-1">
                    <User size={16} className="text-muted" />
                    <span className="text-secondary">{bug.assigned_to.email}</span>
                  </div>
                </div>
              )}

              {bug.project && (
                <div className="border-b border-subtle pb-3">
                  <label className="text-sm text-muted font-medium">Project</label>
                  <div className="mt-1">
                    <Link 
                      to={`/bugs?project=${bug.project.id}`}
                      className="hover:underline"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {bug.project.name}
                    </Link>
                  </div>
                </div>
              )}

              <div className="border-b border-subtle pb-3">
                <label className="text-sm text-muted font-medium">Created</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar size={16} className="text-muted" />
                  <span className="text-secondary">{formatDate(bug.created_at)}</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted font-medium">Last Updated</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar size={16} className="text-muted" />
                  <span className="text-secondary">{formatDate(bug.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <select className="select input w-full">
                <option value={bug.status}>Change Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select className="select input w-full">
                <option value={bug.priority}>Change Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>

              <button className="btn btn-secondary w-full">
                Assign to Me
              </button>
            </div>
          </div>

          {/* Priority Alert */}
          {bug.priority === 'critical' && (
            <div 
              className="card" 
              style={{ 
                border: '1px solid var(--accent-error)',
                background: 'rgba(239, 68, 68, 0.05)'
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                  <AlertTriangle size={20} style={{ color: 'var(--accent-error)' }} />
                </div>
                <h3 className="font-semibold" style={{ color: 'var(--accent-error)' }}>
                  Critical Priority
                </h3>
              </div>
              <p className="text-sm text-muted">
                This bug has been marked as critical and requires immediate attention.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BugDetail;
