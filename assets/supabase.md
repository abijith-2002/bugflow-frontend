# Supabase Integration for BugFlow WebFrontend

This frontend uses Supabase for authentication (email/password). The integration is implemented using the official `@supabase/supabase-js` SDK.

## Required Environment Variables

Copy `bugflow-frontend/WebFrontend/.env.example` to `.env` and set:

- `REACT_APP_SUPABASE_URL`: Your Supabase project URL (e.g., https://xyzcompany.supabase.co)
- `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anon (public) key
- `REACT_APP_SITE_URL`: Public URL for this frontend (e.g., http://localhost:3000 in development). Used for `emailRedirectTo` during sign up.
- `REACT_APP_API_BASE_URL`: Base URL of your FastAPI backend (e.g., http://localhost:8000)

React requires environment variables to be prefixed with `REACT_APP_`.

## Client Setup

The client is created in `src/supabaseClient.js`:

- `persistSession: true` to keep users logged in
- `autoRefreshToken: true` to keep sessions fresh
- `detectSessionInUrl: true` to handle magic link flow

## Auth Flow

- Sign up: `supabase.auth.signUp({ email, password, options: { emailRedirectTo } })`
  - `emailRedirectTo` is computed from `REACT_APP_SITE_URL` + `/auth/callback`
- Sign in: `supabase.auth.signInWithPassword({ email, password })`
- Sign out: `supabase.auth.signOut()`
- Session changes: Subscribed in `AuthContext` via `supabase.auth.onAuthStateChange`

## Backend Integration

This UI sends REST requests to the FastAPI backend using `axios` (`src/services/api.js`), injecting the Supabase session access token as a Bearer token if present.

The backend should verify Supabase JWTs if you secure endpoints using the Authorization header.

## Notes

- Do not hardcode secrets. Use the `.env` variables shown above.
- When deploying, ensure `REACT_APP_SITE_URL` matches the final deployment URL so email magic links correctly return to your app.
