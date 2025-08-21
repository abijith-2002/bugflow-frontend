import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import { 
  Bug, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus,
  ArrowRight
} from 'lucide-react';

// PUBLIC_INTERFACE
const Dashboard = () => {
  /**
   * Dashboard page component showing metrics and recent activities
   * @returns {JSX.Element} Dashboard page
   */
  const [stats, setStats] = useState({
    totalBugs: 0,
    openBugs: 0,
    inProgressBugs: 0,
    resolvedBugs: 0,
    criticalBugs: 0,
    recentBugs: []
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, activitiesData] = await Promise.all([
        dashboardApi.getDashboardStats(),
        dashboardApi.getRecentActivities()
      ]);
      setStats(statsData);
      setActivities(activitiesData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
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
          onClick={fetchDashboardData}
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
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted">Overview of your bug tracking system</p>
        </div>
        <Link to="/bugs/create" className="btn btn-primary flex items-center gap-2">
          <Plus size={20} />
          Report Bug
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm mb-1">Total Bugs</p>
              <p className="text-2xl font-bold">{stats.totalBugs}</p>
            </div>
            <Bug size={24} className="text-muted" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm mb-1">Open Bugs</p>
              <p className="text-2xl font-bold">{stats.openBugs}</p>
            </div>
            <AlertTriangle size={24} style={{ color: 'var(--accent-warning)' }} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm mb-1">In Progress</p>
              <p className="text-2xl font-bold">{stats.inProgressBugs}</p>
            </div>
            <Clock size={24} style={{ color: 'var(--accent-primary)' }} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm mb-1">Resolved</p>
              <p className="text-2xl font-bold">{stats.resolvedBugs}</p>
            </div>
            <CheckCircle size={24} style={{ color: 'var(--accent-success)' }} />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Bugs */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Bugs</h2>
            <Link to="/bugs" className="text-primary hover:underline flex items-center gap-1">
              View All
              <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="space-y-3">
            {stats.recentBugs.length > 0 ? (
              stats.recentBugs.slice(0, 5).map((bug) => (
                <div key={bug.id} className="border-b border-subtle pb-3 last:border-b-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link 
                        to={`/bugs/${bug.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {bug.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={getPriorityBadgeClass(bug.priority)}>
                          {bug.priority}
                        </span>
                        <span className={getStatusBadgeClass(bug.status)}>
                          {bug.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted text-center py-4">No recent bugs</p>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
          </div>
          
          <div className="space-y-3">
            {activities.length > 0 ? (
              activities.slice(0, 5).map((activity, index) => (
                <div key={index} className="border-b border-subtle pb-3 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {activity.type === 'bug_created' && <Plus size={16} style={{ color: 'var(--accent-primary)' }} />}
                      {activity.type === 'bug_updated' && <Clock size={16} style={{ color: 'var(--accent-warning)' }} />}
                      {activity.type === 'bug_resolved' && <CheckCircle size={16} style={{ color: 'var(--accent-success)' }} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted">{activity.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Critical Bugs Alert */}
      {stats.criticalBugs > 0 && (
        <div className="card" style={{ border: '1px solid var(--accent-error)' }}>
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} style={{ color: 'var(--accent-error)' }} />
            <div className="flex-1">
              <h3 className="font-semibold text-error">Critical Bugs Require Attention</h3>
              <p className="text-sm text-muted">
                You have {stats.criticalBugs} critical bug{stats.criticalBugs !== 1 ? 's' : ''} that need immediate attention.
              </p>
            </div>
            <Link 
              to="/bugs?priority=critical" 
              className="btn btn-danger"
            >
              View Critical Bugs
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
