---
member_id: "debugger-4"
ticket: "GAP-SECRETS-001"
priority: "critical"
est_hours: 1
assigned_at: "2026-06-13"
due_by: "2026-06-13"
status: idle
lock: false
---

# Plan — debugger-4: Fix Leaked APP_KEY in Git

## Objective
Remove the leaked `APP_KEY=base64:/GIi+EwBYPEgIUmBFDelvJRGQiEfKNEQ32bDKmbGuHQ=` from git history, rotate the key, and prevent future leaks.

## Context
- Commit `cd729cd` committed `backend/.env` with `APP_KEY`
- `.env` should be in `.gitignore`, not tracked
- Need to:
  1. Remove `.env` from git tracking without deleting local file
  2. Generate a new APP_KEY
  3. Purge from git history (BFG or interactive rebase)
  4. Add `.env` to `.gitignore` (verify it's already there)

## Acceptance Criteria
- [ ] `.env` removed from git tracking (git rm --cached)
- [ ] New APP_KEY generated and deployed (if possible)
- [ ] Old APP_KEY invalidated
- [ ] `.gitignore` confirmed to have `.env`
- [ ] Git history cleaned (BFG or git filter-repo or interactive rebase)

## context_files
- backend/.env
- backend/.env.example
- backend/.gitignore
- backend/config/app.php

## quality_gates
- [ ] Old APP_KEY removed from git history
- [ ] `.env` no longer tracked by git
- [ ] `.env` is in `.gitignore`
