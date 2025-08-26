import React, { useEffect, useState } from 'react';
import { getSupabaseClient } from '../utils/supabaseClient';

export default function AuthCallback() {
  const [status, setStatus] = useState('Processing authentication...');

  useEffect(() => {
    const run = async () => {
      try {
        const supabase = getSupabaseClient();
        if (!supabase) {
          setStatus('Supabase client not configured.');
          return;
        }
        // Newer supabase-js v2 flow: exchange code from URL
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          console.error('Auth callback error:', error);
          setStatus('Authentication error. Please try again.');
          return;
        }
        if (data?.session) {
          setStatus('Authenticated! You can close this tab or return to the app.');
        } else {
          setStatus('No session found. Check your email confirmation or try signing in again.');
        }
      } catch (e) {
        console.error('Auth callback exception:', e);
        setStatus('Authentication error. Please try again.');
      }
    };
    run();
  }, []);

  return (
    <section className="nf-card">
      <h1 className="nf-title">Auth Callback</h1>
      <p className="nf-subtitle">{status}</p>
    </section>
  );
}
