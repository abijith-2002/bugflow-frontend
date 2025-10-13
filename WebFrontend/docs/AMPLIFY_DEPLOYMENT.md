# AWS Amplify Deployment Guide (WebFrontend)

This guide explains how to deploy the BugFlow WebFrontend to AWS Amplify and ensure that routes like `/project/:id` trigger API calls correctly.

## Symptoms (the issue observed)
- On local dev: Navigating to `/project/:id` triggers the expected API calls.
- On Amplify: The page renders, but no API calls appear in the network tab.

## Root cause
- `REACT_APP_API_BASE_URL` is not set (or set to an HTTP URL) in Amplify.
- The frontend defaults to `http://localhost:3001` when the env var is absent. Since Amplify serves over HTTPS, browsers block HTTP requests due to Mixed Content, so the network tab can appear to show no outgoing requests.

A secondary issue was hard navigation via `window.location.assign` from `/dashboard` to `/project/:id`, which causes a full page reload. This has been replaced with client-side navigation via React Router to avoid full reloads.

## Required configuration in Amplify

1) Environment variable (build-time)
- In the Amplify app’s Environment variables, set:
  - `REACT_APP_API_BASE_URL = https://YOUR-BACKEND-API-ORIGIN`
- IMPORTANT: Use HTTPS in production. Examples:
  - `https://api.example.com`
  - `https://your-backend-host:443`
- After changing env vars, trigger a new build/deploy.

2) SPA rewrite rules (single-page app)
- In Amplify Hosting -> Rewrites and redirects, add the standard SPA rule:
  - Source address: `</^[^.]+$|.(?!(css|js|map|png|jpg|svg|ico|json)$)([^.]+$)/>`
  - Target address: `/index.html`
  - Type: `200 (Rewrite)`
- This ensures deep links like `/project/:id` route to the SPA.

3) CORS on the backend
- Ensure the backend (FastAPI) allows the Amplify domain in CORS settings, including `https://<your-amplify-domain>.amplifyapp.com` (or your custom domain).
- Allow methods: GET, POST, PATCH, DELETE; allow `Authorization` header.

## Optional: Runtime override
- The frontend includes a "Backend API Settings" modal (click the status indicator in the top-right of the app header).
- You can set the base URL at runtime for testing, but the long-term fix is to configure `REACT_APP_API_BASE_URL` in Amplify.
- If you previously set a local override (e.g., `http://localhost:3001`) while testing and then deploy to HTTPS, clear the localStorage override:
  - Open DevTools -> Application (or Storage) -> Local Storage -> your domain.
  - Remove the key `bugflow.apiBaseUrl`.
  - Alternatively, use the "Clear Override" button in the production warning banner.

## Misconfiguration detection and warnings
- At runtime, when the app is served over HTTPS, the frontend now:
  - Auto-upgrades non-local HTTP API bases to HTTPS to avoid mixed content.
  - Logs a console warning if the API base points to a localhost host (`localhost`, `127.0.0.1`, `::1`) while the app is on HTTPS.
  - Shows a small in-app warning banner prompting you to configure an HTTPS API base and/or clear the local override.
- Recommendation: always set `REACT_APP_API_BASE_URL` to an HTTPS origin in Amplify for production deployments.

## Verification checklist
- Start from `/login`, authenticate, and land on `/dashboard`.
- Clicking a project navigates client-side to `/project/:id` (no full page reload). You should see:
  - `GET /projects`
  - `GET /work-items?project_id=<id>`
- A manual refresh on `/dashboard` should hydrate the React app and trigger `GET /projects`.
- If requests are blocked:
  - Confirm `REACT_APP_API_BASE_URL` is set and uses HTTPS.
  - Confirm your backend’s CORS allows the Amplify domain.
  - Confirm SPA rewrite rules are configured.
  - Clear any local override in localStorage (`bugflow.apiBaseUrl`) if it points to localhost.

## Notes
- Local dev defaults to `http://localhost:3001` which is fine on HTTP. For production, always use HTTPS.
- We added a small safety in `apiConfig` to auto-upgrade non-local HTTP bases to HTTPS when the app runs over HTTPS, and to warn when localhost overrides are detected on production.
- Client-side navigation is used throughout (React Router) to avoid full reloads; deep links are supported by the SPA rewrite rule.
