# Supabase Integration for BugFlow WebFrontend

This frontend uses Supabase for authentication (email/password) with the official `@supabase/supabase-js` SDK.

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

## Dynamic Site URL Utility

Auth flows should never hardcode URLs. Use the provided helper in `src/utils/getURL.js`:

```js
export const getURL = () => {
  let url = process.env.REACT_APP_SITE_URL || window.location?.origin || 'http://localhost:3000';
  url = url.startsWith('http') ? url : `https://${url}`;
  url = url.endsWith('/') ? url : `${url}/`;
  return url;
};
```

Usage example in sign up:

```js
const siteUrl = getURL();
await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${siteUrl}auth/callback`,
  },
});
```

## Auth Callback

The page at `src/pages/AuthCallback.jsx` handles the return from Supabase by exchanging the code for a session and redirecting to the dashboard, with graceful error handling.

## Backend Integration

This UI sends REST requests to the FastAPI backend using `axios` (`src/services/api.js`), injecting the Supabase session access token as a Bearer token if present.

The backend verifies Supabase JWTs when securing endpoints using the Authorization header.

## Supabase Dashboard Configuration

- Go to Authentication > URL Configuration:
  - Site URL: match `REACT_APP_SITE_URL` (e.g. http://localhost:3000 in development)
  - Additional Redirect URLs:
    * http://localhost:3000/**
    * https://yourapp.com/**
- Optional: Update email templates to reference the configured Site URL and redirect paths.

## Storage (Attachments)

If you plan to upload files (e.g., bug attachments), configure a private bucket named `attachments` and apply RLS (see backend supabase.md for SQL). From the client, prefix uploads under a user folder (e.g. `${user.id}/filename.ext`) for optional per-user access policies.

## Notes

- Do not hardcode secrets. Use the `.env` variables shown above.
- When deploying, ensure `REACT_APP_SITE_URL` matches the final deployment URL so email magic links correctly return to your app.
- Include both localhost and production URLs in Supabase Auth allowlist.
