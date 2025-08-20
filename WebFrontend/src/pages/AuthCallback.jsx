import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase will parse tokens from URL automatically due to detectSessionInUrl
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 1200);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="card">
      <h2>Authentication</h2>
      <p className="text-muted">Completing sign-in flow...</p>
    </div>
  );
}
