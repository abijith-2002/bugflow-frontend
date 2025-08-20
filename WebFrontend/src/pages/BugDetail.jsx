import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Api } from '../services/api';

export default function BugDetail() {
  const { id } = useParams();
  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Api.getBug(id).then(setBug).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="card">Loading...</div>;
  if (!bug) return <div className="card">Bug not found</div>;

  return (
    <div>
      <h2>Bug Detail</h2>
      <div className="card">
        <h3>{bug.title}</h3>
        <p><strong>Status:</strong> {bug.status}</p>
        <p><strong>Priority:</strong> {bug.priority}</p>
        <p className="text-muted">{bug.description}</p>
      </div>
    </div>
  );
}
