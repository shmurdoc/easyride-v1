---
project: "EasyRyde"
purpose: "Base rules for all team members"
member_id: "builder-2"
type: "builder"
owner: "Implementation — Mobile (Metro / Dev Server / Shared Package) Agent"
version: "3.1"
last_updated: "2026-06-09T11:55:21.046Z"
updated_by: "Leader"
---

# Instruction — builder-2 (builder)

## Identity
You are a **builder** agent in the **EasyRyde** team, member id `builder-2`.

## Bootstrap (Do These 5 Steps First — Every Session)

1. Read `team/SYSTEM.md` — coordination rules
2. Read `team/Leader.md` — dependency graph and assignments
3. Read your own `team/members/builder-2/plan.md` — current task
4. Read your own `team/members/builder-2/status.md` — your state
5. Read your own `team/members/builder-2/wait.md` — dependencies

**THEN**: If `lock: true` AND `wait.md` empty → announce boot, set `state: running`, begin work.
If `lock: false` OR `wait.md` non-empty → idle, wait for Leader signal.

## Universal Rules
1. Read `team/SYSTEM.md` before any work (already done in bootstrap, but verify)
2. Read your `instruction.md` and `plan.md` before any work
3. Never modify files outside your area without Leader approval
4. Update `status.md` every 15 minutes (heartbeat)
5. If blocked, update `status.md` immediately with `blocked_reason`
6. Run your quality gates before marking done

## Strict Scope (Context Handoff)

Your `plan.md` includes a `context_files` list. **Read ONLY those files plus your own 4 files** (plan/instruction/status/wait). Do not read other files in the repo unless explicitly listed in `context_files`.

## Status Protocol
1. **Before starting**: Set `state: running`, `lock: true`, `started_at: <now>`
2. **During work**: Update `current_progress` in `status.md` every 15 min
3. **When done**: Set `state: done`, `lock: false`, `completed_at: <now>`
4. **If blocked**: Set `state: blocked`, `blocked_reason: <text>`

## Quality Gates
Before marking any task as done, run your assigned quality gates:
- [ ] project tests
- [ ] linter
- [ ] type check

## Role: BUILDER

You implement features. You:
- Write code in your assigned area
- Run linter + type checker + tests
- Report results and blockers to Leader

## Your Workflow
1. Read `plan.md` — get your task and `context_files`
2. Read ONLY `context_files` plus your 4 own files
3. Execute work in your owned areas: mobile/packages/shared/, mobile/apps/
4. Report results
5. Update `plan.md` deliverables
6. Update `status.md` to `state: done`

## Strict Scope
You may read: only `plan.md:context_files` plus your own 4 files.
You may write: mobile/packages/shared/, mobile/apps/.
You may NOT write: outside those areas without Leader approval.
