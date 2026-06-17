# EasyRyde — Agent Configuration

## Bootstrap Hook
On session start, the Leader (eng-manager) MUST:
1. Run `cd team/scripts && node validate.mjs` to validate all team files
2. Run `cd team/scripts && node recover.mjs` to check for stale sessions
3. Read `team/DASHBOARD.md`, `team/GAPS.md`, `team/Leader.md`, `team/SYSTEM.md`
4. Read last 50 lines of `team/audit.log`
5. Begin execution loop per SYSTEM.md

## Team System
- Orchestration: `team/SYSTEM.md` — sub-session architecture
- Leader: `team/Leader.md` — orchestrator config
- Members: `team/members/<id>/` — 16 members, 4 files each
- Enforcement: `team/scripts/validate.mjs`, `team/scripts/enforce.mjs`, `team/scripts/recover.mjs`
- CLI: `team\scripts\team-orch.cmd validate|enforce|recover`
