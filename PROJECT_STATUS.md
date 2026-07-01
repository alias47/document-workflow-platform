# PROJECT STATUS

Version

v0.5.1

Status

🟡 Phase 0 Foundation Fixes Applied

Completed

✅ Documentation

✅ Monorepo Foundation

✅ UI Foundation

✅ Authentication Backend (HTTP-only cookie auth, JWT strategy, RBAC)

✅ Authentication UI

✅ Dashboard

✅ Applicant Database

✅ Applicant Backend CRUD

✅ Frontend API Infrastructure

⚠️ Applicant End-to-End Integration (scaffolded; mock data still active behind env.isDev gate)

Current Focus

Sprint 7 – Document Management

Notes

- Auth uses HttpOnly cookies (access_token + refresh_token); no Bearer tokens in body or JS
- Applicant mock data remains active for dev; production requires backend running with valid DB
- Permission name applicant.archive (not applicant.delete) is the canonical soft-delete action
