#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEAM_DIR = path.resolve(__dirname, '..');
const MEMBERS_DIR = path.join(TEAM_DIR, 'members');
const AUDIT_LOG = path.join(TEAM_DIR, 'audit.log');
const ENFORCE_LOG = path.join(TEAM_DIR, 'enforce.log');
const STALE_THRESHOLD_MS = 30 * 60 * 1000;

function now() { return new Date().toISOString(); }

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const yaml = match[1];
  const result = {};
  const lines = yaml.split('\n');
  for (const line of lines) {
    const eqIdx = line.indexOf(': ');
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let rawVal = line.slice(eqIdx + 2).trim();
    if (rawVal === 'true') result[key] = true;
    else if (rawVal === 'false') result[key] = false;
    else if (rawVal === '[]') result[key] = [];
    else if (rawVal.startsWith('"') && rawVal.endsWith('"')) result[key] = rawVal.slice(1, -1);
    else result[key] = rawVal;
  }
  return result;
}

function serializeFrontmatter(fields) {
  let yaml = '---\n';
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'boolean') yaml += `${k}: ${v}\n`;
    else if (Array.isArray(v)) yaml += `${k}: ${JSON.stringify(v)}\n`;
    else yaml += `${k}: "${v}"\n`;
  }
  return yaml + '---';
}

function buildStatusContent(memberId, fm) {
  const yaml = serializeFrontmatter(fm);
  let blockedLine = fm.blocked_reason ? fm.blocked_reason : '(none)';
  return `${yaml}\n\n# Status — ${memberId}\n\n## Current State\n${fm.state}\n\n## Progress\n${fm.current_progress || '(none)'}\n\n## Blockers\n${blockedLine}\n\n## Notes\nManaged by recovery protocol.\n`;
}

function buildPlanContent(memberId, fm) {
  const yaml = serializeFrontmatter(fm);
  const taskLine = fm.status === 'blocked' ? '(blocked — auto-recovered)' : '(completed)';
  return `${yaml}\n\n# Plan — ${memberId} (${fm.type || 'unknown'})\n\n## Current Task\n${taskLine}\n\n## Deliverables\n(none)\n\n## Preconditions\n(none)\n\n## Acceptance Criteria\n(none)\n\n## Context Files\nRead ONLY the files listed in the frontmatter context_files field, plus your own 4 files. Nothing else.\n\n## Strict Scope\nstrict_scope: ${fm.strict_scope} — if true, you may only read files listed in context_files plus your own 4 files. If you need more, request scope expansion from Leader.\n\n## Completed Tasks\n(none)\n`;
}

function recover() {
  console.log('=== CRASH RECOVERY PROTOCOL ===');
  console.log('');
  console.log(`Time: ${now()}`);
  console.log(`Stale threshold: ${STALE_THRESHOLD_MS / 1000 / 60} minutes`);
  console.log('');

  if (!fs.existsSync(MEMBERS_DIR)) {
    console.log('ERROR: Members directory not found.');
    process.exit(1);
  }

  const memberDirs = fs.readdirSync(MEMBERS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const recovered = [];
  const staleSessions = [];
  const inconsistent = [];

  for (const memberId of memberDirs) {
    const memberDir = path.join(MEMBERS_DIR, memberId);
    const statusPath = path.join(memberDir, 'status.md');
    const planPath = path.join(memberDir, 'plan.md');

    if (!fs.existsSync(statusPath)) {
      inconsistent.push({ memberId, issue: 'status.md missing' });
      continue;
    }

    const statusContent = fs.readFileSync(statusPath, 'utf8');
    const statusFm = parseFrontmatter(statusContent);

    if (statusFm.state === 'running') {
      const startedAt = statusFm.started_at || '';
      const isStale = startedAt && (new Date() - new Date(startedAt).getTime() > STALE_THRESHOLD_MS);

      if (isStale) {
        const planContent = fs.existsSync(planPath) ? fs.readFileSync(planPath, 'utf8') : '';
        const planFm = planContent ? parseFrontmatter(planContent) : {};

        const newStatusFm = {
          ...statusFm,
          state: 'blocked',
          current_progress: statusFm.current_progress || '',
          started_at: statusFm.started_at || '',
          completed_at: '',
          blocked_reason: `Auto-recovered: stale session (started ${statusFm.started_at}, >30 min without completion)`,
          updated_by: 'recover.mjs',
          updated_at: now()
        };

        const newPlanFm = {
          ...planFm,
          lock: false,
          status: 'blocked',
          member_id: planFm.member_id || memberId,
          updated_by: 'recover.mjs',
          updated_at: now()
        };

        if (!newPlanFm.project) newPlanFm.project = 'EasyRyde';
        if (!newPlanFm.purpose) newPlanFm.purpose = 'Member plan — current task objectives and deliverables';
        if (newPlanFm.type === undefined) newPlanFm.type = '';
        if (newPlanFm.ticket === undefined) newPlanFm.ticket = '';
        if (newPlanFm.priority === undefined) newPlanFm.priority = 'medium';
        if (newPlanFm.review_required === undefined) newPlanFm.review_required = false;
        if (newPlanFm.time_estimate === undefined) newPlanFm.time_estimate = '';
        if (newPlanFm.time_spent === undefined) newPlanFm.time_spent = '';
        if (newPlanFm.context_files === undefined) newPlanFm.context_files = [];
        if (newPlanFm.strict_scope === undefined) newPlanFm.strict_scope = true;
        if (newPlanFm.artifact_refs === undefined) newPlanFm.artifact_refs = [];
        if (newPlanFm.created_at === undefined) newPlanFm.created_at = statusFm.updated_at || now();
        if (newPlanFm.owner === undefined) newPlanFm.owner = '';

        fs.writeFileSync(statusPath, buildStatusContent(memberId, newStatusFm));
        fs.writeFileSync(planPath, buildPlanContent(memberId, newPlanFm));

        staleSessions.push({ memberId, startedAt, ticket: planFm.ticket || '(unassigned)' });
        recovered.push({ memberId, type: 'stale', detail: `state=running -> blocked (stale since ${startedAt})` });
      }
    }

    if (statusFm.state === 'done' && statusFm.lock === true) {
      const newStatusFm = {
        ...statusFm,
        lock: false,
        updated_by: 'recover.mjs',
        updated_at: now()
      };
      const planContent = fs.existsSync(planPath) ? fs.readFileSync(planPath, 'utf8') : '';
      const planFm = planContent ? parseFrontmatter(planContent) : {};
      const newPlanFm = {
        ...planFm,
        lock: false,
        member_id: planFm.member_id || memberId,
        updated_by: 'recover.mjs',
        updated_at: now()
      };
      if (!newPlanFm.project) newPlanFm.project = 'EasyRyde';
      if (!newPlanFm.purpose) newPlanFm.purpose = 'Member plan — current task objectives and deliverables';

      fs.writeFileSync(statusPath, buildStatusContent(memberId, newStatusFm));
      fs.writeFileSync(planPath, buildPlanContent(memberId, newPlanFm));

      recovered.push({ memberId, type: 'lock_stuck', detail: 'state=done but lock=true -> lock cleared' });
    }
  }

  const configPath = path.join(TEAM_DIR, 'team.config.json');
  const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : { members: [] };
  const memberCount = config.members ? config.members.length : 0;

  console.log(`Members scanned: ${memberDirs.length} (${memberCount} in config)`);
  console.log(`Stale sessions found: ${staleSessions.length}`);
  console.log(`Inconsistent files: ${inconsistent.length}`);
  console.log(`Recovered issues: ${recovered.length}`);
  console.log('');

  if (staleSessions.length > 0) {
    console.log('Stale Sessions Auto-Blocked:');
    for (const s of staleSessions) {
      console.log(`  - ${s.memberId} (started ${s.startedAt}, ticket: ${s.ticket})`);
    }
    console.log('');
  }

  if (inconsistent.length > 0) {
    console.log('Inconsistent Files (manual review needed):');
    for (const i of inconsistent) {
      console.log(`  - ${i.memberId}: ${i.issue}`);
    }
    console.log('');
  }

  if (recovered.length === 0) {
    console.log('RECOVERY: No issues found — system is clean.');
  } else {
    console.log(`RECOVERY COMPLETE — ${recovered.length} issue(s) resolved.`);
  }

  const auditLine = `[${now()}] RECOVER: ${recovered.length} issue(s) found and fixed. ${staleSessions.length} stale session(s) blocked.`;
  fs.appendFileSync(AUDIT_LOG, auditLine + '\n', 'utf8');
  fs.appendFileSync(ENFORCE_LOG, `[${now()}] RECOVERY: ${recovered.length} issue(s) resolved, ${staleSessions.length} stale session(s) blocked\n`, 'utf8');

  process.exit(0);
}

recover();
