import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Api } from '../services/api';

export default function Bugs() {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Api.listBugs().then(setBugs).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>Bugs</h2>
      <div className="card">
        {loading ? <div>Loading bugs...</div> : (
          <ul className="list">
            {bugs.map((b, idx) => (
              <li className="list-item" key={b.id || idx}>
                <Link to={`/bugs/${b.id || idx}`}>{b.title || 'Untitled bug'}</Link>
                <div className="text-muted">{b.status || 'open'}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
