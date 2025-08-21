import React, { useState } from 'react';
import Header from './Header';
import MetricCard from './MetricCard';
import RecentActivity from './RecentActivity';
import QuickActions from './QuickActions';

// PUBLIC_INTERFACE
const Dashboard = () => {
  const [activeNavItem, setActiveNavItem] = useState('Home');

  // Sample metrics data
  const metricsData = [
    {
      title: 'TOTAL BUGS',
      value: '247',
      subtitle: '+12 this week',
      trend: 'up'
    },
    {
      title: 'RESOLVED',
      value: '189',
      subtitle: '76% completion',
      trend: 'neutral'
    },
    {
      title: 'IN PROGRESS',
      value: '34',
      subtitle: '14% active',
      trend: 'neutral'
    },
    {
      title: 'CRITICAL',
      value: '8',
      subtitle: 'Needs attention',
      trend: 'down'
    }
  ];

  return (
    <div className="dashboard">
      <Header 
        activeNavItem={activeNavItem} 
        setActiveNavItem={setActiveNavItem} 
      />
      <main className="dashboard-main">
        {/* Metrics Grid */}
        <section className="metrics-section">
          <div className="metrics-grid">
            {metricsData.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
                subtitle={metric.subtitle}
                trend={metric.trend}
              />
            ))}
          </div>
        </section>

        {/* Content Grid */}
        <section className="content-section">
          <div className="content-grid">
            <RecentActivity />
            <QuickActions />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
