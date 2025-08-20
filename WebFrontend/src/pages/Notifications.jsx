import React, { useEffect, useState } from 'react';
import { Api } from '../services/api';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Api.listNotifications().then(setItems).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    await Api.markNotificationRead(id);
    load();
  };

  return (
    <div>
      <h2>Notifications</h2>
      <div className="card">
        {loading ? <div>Loading...</div> : (
          <ul className="list">
            {items.map((n, idx) => (
              <li className="list-item" key={n.id || idx}>
                <div><strong>{n.title || 'Notification'}</strong></div>
                <div className="text-muted">{n.message}</div>
                <button className="btn" onClick={() => markRead(n.id || idx)}>Mark as read</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
