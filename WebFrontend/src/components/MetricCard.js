import React from 'react';

// PUBLIC_INTERFACE
const MetricCard = ({ title, value, subtitle, trend }) => {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-title">{title}</span>
      </div>
      <div className="metric-content">
        <div className="metric-value">{value}</div>
        <div className="metric-subtitle">{subtitle}</div>
      </div>
      {trend && (
        <div className={`metric-trend ${trend}`}>
          {trend === 'up' && '↗'}
          {trend === 'down' && '↘'}
          {trend === 'neutral' && '→'}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
