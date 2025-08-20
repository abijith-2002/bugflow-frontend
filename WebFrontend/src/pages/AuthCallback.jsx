import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { handleAuthError } from '../utils/auth';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const processAuth = async () => {
      try {
        // If this is a PKCE/magic link callback, exchange the code for a session.
        const params = new URLSearchParams(window.location.search);
        if (params.has('code')) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) {
            handleAuthError(error, navigate);
            return;
          }
        }
        // Fallback: ensure we have a session
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          handleAuthError(error, navigate);
          return;
        }
        if (!data?.session) {
          // No session found - send to login
          navigate('/login', { replace: true });
          return;
        }
      } catch (err) {
        handleAuthError(err, navigate);
        return;
      }
      // Success - go to dashboard
      navigate('/', { replace: true });
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="card">
      <h2>Authentication</h2>
      <p className="text-muted">Completing sign-in flow...</p>
    </div>
  );
}
