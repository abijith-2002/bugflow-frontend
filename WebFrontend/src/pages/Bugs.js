import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { bugsApi } from '../services/api';
import { 
  Plus, 
  Search, 
  Bug, 
  Calendar,
  User,
  ExternalLink
} from 'lucide-react';

// PUBLIC_INTERFACE
const Bugs = () => {
  /**
   * Bugs page component for listing and managing bugs
   * @returns {JSX.Element} Bugs page
   */
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignee: ''
  });
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Initialize filters from URL params
    const urlFilters = {
      status: searchParams.get('status') || '',
      priority: searchParams.get('priority') || '',
      project: searchParams.get('project') || ''
    };
    setFilters(urlFilters);
    fetchBugs(urlFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchBugs = useCallback(async (filterParams = filters) => {
    try {
      setLoading(true);
      const data = await bugsApi.getBugs(filterParams);
      setBugs(data);
    } catch (err) {
      setError('Failed to load bugs');
      console.error('Bugs error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const filteredBugs = bugs.filter(bug =>
    bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bug.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    return new Date(dateString).toLocaleDateString();
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchBugs(newFilters);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-error mb-4">{error}</p>
        <button 
          onClick={() => fetchBugs()}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Bugs</h1>
          <p className="text-muted">Track and manage bug reports</p>
        </div>
        <Link to="/bugs/create" className="btn btn-primary flex items-center gap-2">
          <Plus size={20} />
          Report Bug
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search bugs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="select input"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className="select input"
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Bugs List */}
      {filteredBugs.length > 0 ? (
        <div className="space-y-4">
          {filteredBugs.map((bug) => (
            <div key={bug.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <Bug size={20} className="mt-1 text-muted" />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link 
                          to={`/bugs/${bug.id}`}
                          className="text-lg font-semibold text-primary hover:underline"
                        >
                          {bug.title}
                        </Link>
                        <span className={getPriorityBadgeClass(bug.priority)}>
                          {bug.priority}
                        </span>
                        <span className={getStatusBadgeClass(bug.status)}>
                          {bug.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <p className="text-muted text-sm mb-3 line-clamp-2">
                        {bug.description}
                      </p>

                      <div className="flex items-center gap-6 text-sm text-muted">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>Created {formatDate(bug.created_at)}</span>
                        </div>
                        
                        {bug.assigned_to && (
                          <div className="flex items-center gap-1">
                            <User size={14} />
                            <span>Assigned to {bug.assigned_to.email}</span>
                          </div>
                        )}

                        {bug.project && (
                          <div className="flex items-center gap-1">
                            <span>Project: {bug.project.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Link 
                  to={`/bugs/${bug.id}`}
                  className="p-2 hover:bg-tertiary rounded"
                >
                  <ExternalLink size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bug size={48} className="mx-auto mb-4 text-muted" />
          <h3 className="text-lg font-semibold mb-2">No bugs found</h3>
          <p className="text-muted mb-4">
            {searchTerm || Object.values(filters).some(f => f) 
              ? 'No bugs match your search criteria.' 
              : 'No bugs have been reported yet.'}
          </p>
          {!searchTerm && !Object.values(filters).some(f => f) && (
            <Link to="/bugs/create" className="btn btn-primary">
              Report First Bug
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Bugs;
