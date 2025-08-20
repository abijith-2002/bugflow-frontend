import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import { getURL } from '../utils/getURL';

const AuthContext = createContext(null);

/**
 * PUBLIC_INTERFACE
 * AuthProvider subscribes to Supabase session changes and exposes:
 * - user: the current authenticated user or null
 * - session: the current session object
 * - loading: boolean while loading initial session
 * - signIn(email, password)
 * - signUp(email, password)
 * - signOut()
 */
export function AuthProvider({ children }) {
  /** Provides authentication context to the component tree. */
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load initial session and subscribe to changes
  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    }
    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    // PUBLIC_INTERFACE
    /** Sign in with email/password */
    signIn: async (email, password) => {
      /** Uses supabase.auth.signInWithPassword to authenticate. */
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    // PUBLIC_INTERFACE
    /** Sign up with email/password and email redirect */
    signUp: async (email, password) => {
      /** Uses supabase.auth.signUp to register a new user. */
      const siteUrl = getURL(); // Ensures protocol and trailing slash
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${siteUrl}auth/callback`,
        },
      });
      if (error) throw error;
    },
    // PUBLIC_INTERFACE
    /** Sign out current user */
    signOut: async () => {
      /** Uses supabase.auth.signOut to end the session. */
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  }), [user, session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * Hook to access auth context values.
 */
export function useAuth() {
  /** Returns the Auth context. */
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
