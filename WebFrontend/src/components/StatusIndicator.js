import React from 'react';

// PUBLIC_INTERFACE
const StatusIndicator = ({ status = 'online', message = 'System operational' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return '#10b981'; // green
      case 'warning':
        return '#f59e0b'; // yellow
      case 'error':
        return '#ef4444'; // red
      case 'offline':
        return '#6b7280'; // gray
      default:
        return '#3b82f6'; // blue
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'online':
        return '🟢';
      case 'warning':
        return '🟡';
      case 'error':
        return '🔴';
      case 'offline':
        return '⚫';
      default:
        return '🔵';
    }
  };

  return (
    <div className="status-indicator" style={{ '--status-color': getStatusColor() }}>
      <span className="status-icon">{getStatusIcon()}</span>
      <span className="status-message">{message}</span>
    </div>
  );
};

export default StatusIndicator;
