---
project: "EasyRyde"
purpose: "Team orchestration onboarding documentation"
last_updated: "2026-06-09T11:55:21.046Z"
---

# team-orch — Team Orchestration System

## Project: EasyRyde

## Quick Start
```
team-orch validate
team-orch enforce
```

## Commands
- `team-orch validate` — Validate team file format
- `team-orch enforce` — Run enforcement check
- `team-orch recover` — Recover crashed/stale sessions

## Members
| ID | Type | Role | Area |
|----|------|------|------|
| ceo | ceo | Strategic direction and decomposition | docs/strategy/ |
| eng-manager | eng-manager | Planning and execution framing (Leader) | team/ |
| designer | designer | UX and product-design decisions | mobile/packages/shared/ |
| builder-1 | builder | Implementation — Mobile (Android builds / Expo prebuild) | mobile/apps/ |
| builder-2 | builder | Implementation — Mobile (Metro / Dev Server / Shared Package) | mobile/packages/shared/, mobile/apps/ |
| builder-3 | builder | Implementation — Backend (Laravel / PHP) | backend/ |
| reviewer | reviewer | Code quality and review (Senior Lead) | team/reviews/ |
| debugger-1 | debugger | Root-cause analysis #1 (on-call) | . |
| debugger-2 | debugger | Root-cause analysis #2 | . |
| debugger-3 | debugger | Root-cause analysis #3 | . |
| debugger-4 | debugger | Root-cause analysis #4 (overflow) | . |
| qa-lead-backend | qa-lead | QA — Backend (PHP/Pest, API integration) | backend/tests/ |
| qa-lead-frontend | qa-lead | QA — Mobile (Jest / React Native Testing Library) | mobile/ |
| qa-lead-integration | qa-lead | QA — Integration (Docker, E2E, CI) | .github/workflows/, docker-compose.yml |
| release-engineer | release-engineer | Release readiness and publishing flow | .github/workflows/, team/ |
| doc-engineer | doc-engineer | Documentation and handoff quality | docs/ |

## How It Works
Each member gets a `team/members/<id>/` directory with:
- `plan.md` — Current task and objectives (with context_files for strict scope)
- `instruction.md` — Role-specific rules and tools
- `status.md` — Current state (idle/running/done/blocked)
- `wait.md` — Dependencies on other members

## Agent Types
| Type | Role | Skills |
|------|------|--------|
| ceo | Strategic direction | /office-hours, /plan-ceo-review |
| eng-manager | Leader | /plan-eng-review, /retro, /plan-tune |
| designer | UX/product design | /design-shotgun, /design-consultation |
| builder | Implementation | /review, /health |
| reviewer | Code review | /review, /health |
| debugger | Root-cause analysis | /investigate, /review |
| qa-lead | Test/QA | /qa, /browse, /investigate |
| release-engineer | Ship/deploy | /ship, /land-and-deploy, /canary |
| doc-engineer | Documentation | /document-generate, /document-release |
