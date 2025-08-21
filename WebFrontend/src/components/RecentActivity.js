import React from 'react';

// PUBLIC_INTERFACE
const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: 'bug_created',
      title: 'Bug #247 - Login form validation error',
      user: 'Sarah Chen',
      time: '2 minutes ago',
      severity: 'high'
    },
    {
      id: 2,
      type: 'bug_resolved',
      title: 'Bug #245 - Dashboard loading issue',
      user: 'Mike Johnson',
      time: '15 minutes ago',
      severity: 'medium'
    },
    {
      id: 3,
      type: 'bug_assigned',
      title: 'Bug #243 - API timeout on search',
      user: 'Alex Rodriguez',
      time: '1 hour ago',
      severity: 'critical'
    },
    {
      id: 4,
      type: 'bug_updated',
      title: 'Bug #241 - UI inconsistency in mobile',
      user: 'Emma Wilson',
      time: '2 hours ago',
      severity: 'low'
    },
    {
      id: 5,
      type: 'bug_created',
      title: 'Bug #239 - Database connection failure',
      user: 'David Kim',
      time: '3 hours ago',
      severity: 'critical'
    }
  ];

  // PUBLIC_INTERFACE
  const getActivityIcon = (type) => {
    switch (type) {
      case 'bug_created':
        return '🐛';
      case 'bug_resolved':
        return '✅';
      case 'bug_assigned':
        return '👤';
      case 'bug_updated':
        return '📝';
      default:
        return '📋';
    }
  };

  // PUBLIC_INTERFACE
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#3b82f6';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="recent-activity-card">
      <div className="card-header">
        <h3 className="card-title">Recent Activity</h3>
      </div>
      <div className="activity-list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div className="activity-icon">
              {getActivityIcon(activity.type)}
            </div>
            <div className="activity-content">
              <div className="activity-title">{activity.title}</div>
              <div className="activity-meta">
                <span className="activity-user">{activity.user}</span>
                <span className="activity-time">{activity.time}</span>
                <span 
                  className="activity-severity"
                  style={{ color: getSeverityColor(activity.severity) }}
                >
                  {activity.severity}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="card-footer">
        <button className="view-all-btn">View All Activity</button>
      </div>
    </div>
  );
};

export default RecentActivity;
