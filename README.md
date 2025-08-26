# Project Repository

This repository contains BugFlow Frontend and Backend.

## Frontend local setup
1) Copy WebFrontend/.env.example to WebFrontend/.env and set:
   - REACT_APP_API_BASE=http://localhost:3001
   - (optional) REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY if you use frontend Supabase SDK.
2) `cd WebFrontend && npm install && npm start`

## Backend local setup
See bugflow-backend/APIBackend/README.md. Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set.