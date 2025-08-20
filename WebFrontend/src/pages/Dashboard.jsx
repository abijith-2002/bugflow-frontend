import React, { useEffect, useState } from 'react';
import { Api } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ projects: 0, open_bugs: 0, my_bugs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Api.fetchDashboard().then((data) => {
      setStats({
        projects: data.projects ?? 0,
        open_bugs: data.open_bugs ?? 0,
        my_bugs: data.my_bugs ?? 0,
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card">Loading dashboard...</div>;

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="grid">
        <div className="card">
          <h3>Projects</h3>
          <p className="title">{stats.projects}</p>
        </div>
        <div className="card">
          <h3>Open Bugs</h3>
          <p className="title">{stats.open_bugs}</p>
        </div>
        <div className="card">
          <h3>My Bugs</h3>
          <p className="title">{stats.my_bugs}</p>
        </div>
      </div>
    </div>
  );
}
