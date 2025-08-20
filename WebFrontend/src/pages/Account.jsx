import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Account() {
  const { user } = useAuth();
  return (
    <div>
      <h2>My Account</h2>
      <div className="card">
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>User ID:</strong> {user?.id}</p>
      </div>
    </div>
  );
}
