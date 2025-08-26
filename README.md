# Project Repository

This repository contains BugFlow Frontend and Backend.

## Frontend local setup
1) Copy WebFrontend/.env.example to WebFrontend/.env and set:
   - REACT_APP_API_BASE=http://localhost:3001 (initial value; can be changed at runtime via the status indicator)
   - (optional) REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY if you use frontend Supabase SDK.
2) `cd WebFrontend && npm install && npm start`

Note: The frontend now supports changing the backend API base URL at runtime. Use the status indicator at the top-right to open a dialog and update the URL. The value is persisted in localStorage.

## Backend local setup
See bugflow-backend/APIBackend/README.md. Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set.