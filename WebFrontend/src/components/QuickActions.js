import React from 'react';

// PUBLIC_INTERFACE
const QuickActions = () => {
  const actions = [
    {
      id: 1,
      title: 'Report New Bug',
      description: 'Create a new bug report',
      icon: '🐛',
      color: '#ef4444',
      action: 'create_bug'
    },
    {
      id: 2,
      title: 'Create Project',
      description: 'Start a new project',
      icon: '📁',
      color: '#3b82f6',
      action: 'create_project'
    },
    {
      id: 3,
      title: 'Assign Tasks',
      description: 'Delegate bug fixes',
      icon: '👥',
      color: '#8b5cf6',
      action: 'assign_tasks'
    },
    {
      id: 4,
      title: 'Generate Report',
      description: 'Create analytics report',
      icon: '📊',
      color: '#10b981',
      action: 'generate_report'
    },
    {
      id: 5,
      title: 'System Settings',
      description: 'Configure preferences',
      icon: '⚙️',
      color: '#f59e0b',
      action: 'settings'
    }
  ];

  // PUBLIC_INTERFACE
  const handleActionClick = (action) => {
    console.log(`Executing action: ${action}`);
    // Here you would implement the actual action logic
  };

  return (
    <div className="quick-actions-card">
      <div className="card-header">
        <h3 className="card-title">Quick Actions</h3>
      </div>
      <div className="actions-list">
        {actions.map((action) => (
          <button
            key={action.id}
            className="action-item"
            onClick={() => handleActionClick(action.action)}
            style={{ '--action-color': action.color }}
          >
            <div className="action-icon">
              {action.icon}
            </div>
            <div className="action-content">
              <div className="action-title">{action.title}</div>
              <div className="action-description">{action.description}</div>
            </div>
            <div className="action-arrow">
              →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
