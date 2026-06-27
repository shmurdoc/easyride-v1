#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEAM_DIR = path.resolve(__dirname, '..');
const MEMBERS_DIR = path.join(TEAM_DIR, 'members');
const ENFORCE_LOG = path.join(TEAM_DIR, 'enforce.log');
const AUDIT_LOG = path.join(TEAM_DIR, 'audit.log');

const STALE_THRESHOLD_MS = 30 * 60 * 1000;
const HEARTBEAT_LOG = path.join(TEAM_DIR, '.heartbeat');
const CONFIG_PATH = path.join(TEAM_DIR, 'team.config.json');

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

function logToFile(filePath, message) {
  const ts = now();
  const line = `[${ts}] ${message}\n`;
  fs.appendFileSync(filePath, line, 'utf8');
}

function readStatusFile(memberDir) {
  const p = path.join(memberDir, 'status.md');
  if (!fs.existsSync(p)) return null;
  return { path: p, fm: parseFrontmatter(fs.readFileSync(p, 'utf8')), content: fs.readFileSync(p, 'utf8') };
}

function readPlanFile(memberDir) {
  const p = path.join(memberDir, 'plan.md');
  if (!fs.existsSync(p)) return null;
  return { path: p, fm: parseFrontmatter(fs.readFileSync(p, 'utf8')), content: fs.readFileSync(p, 'utf8') };
}

function enforce() {
  const violations = [];

  fs.writeFileSync(HEARTBEAT_LOG, now(), 'utf8');

  if (!fs.existsSync(MEMBERS_DIR)) {
    logToFile(ENFORCE_LOG, `[ERROR] Members directory not found`);
    console.log('ENFORCEMENT FAILED — members directory not found');
    process.exit(1);
  }

  const memberDirs = fs.readdirSync(MEMBERS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const memberId of memberDirs) {
    const memberDir = path.join(MEMBERS_DIR, memberId);

    const status = readStatusFile(memberDir);
    const plan = readPlanFile(memberDir);

    if (!status) {
      violations.push({ memberId, type: 'MISSING_STATUS', detail: 'status.md not found' });
      continue;
    }
    if (!plan) {
      violations.push({ memberId, type: 'MISSING_PLAN', detail: 'plan.md not found' });
      continue;
    }

    const { fm: statusFm } = status;
    const { fm: planFm } = plan;

    if (statusFm.state === 'running' && statusFm.lock !== true) {
      violations.push({ memberId, type: 'LOCK_STATE_MISMATCH', detail: `state=running but lock=${statusFm.lock}` });
    }

    const planState = planFm.status ?? planFm.state;
    if (statusFm.state === 'running' && planState !== 'running') {
      violations.push({ memberId, type: 'PLAN_STATUS_MISMATCH', detail: `status.md state=running but plan.md state=${planState}` });
    }

    if (statusFm.state === 'done' && statusFm.lock === true) {
      violations.push({ memberId, type: 'DONE_WITH_LOCK', detail: 'state=done but lock=true (Leader should clear lock)' });
    }

    if (statusFm.state === 'running' && planFm.strict_scope === true && (!planFm.context_files || planFm.context_files.length === 0)) {
      violations.push({ memberId, type: 'STRICT_SCOPE_NO_FILES', detail: 'strict_scope=true but context_files is empty' });
    }
  }

  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      if (config.members && Array.isArray(config.members)) {
        const memberSet = new Set(memberDirs);
        for (const m of config.members) {
          if (!memberSet.has(m.id)) {
            violations.push({ memberId: m.id, type: 'CONFIG_ENTRY_NO_DIR', detail: `registered in config but no directory at team/members/${m.id}` });
          }
        }
      }
    } catch (e) {
      violations.push({ memberId: 'config', type: 'CONFIG_PARSE_ERROR', detail: e.message });
    }
  }

  const currentTime = new Date().getTime();
  for (const memberId of memberDirs) {
    const memberDir = path.join(MEMBERS_DIR, memberId);
    const status = readStatusFile(memberDir);
    if (status && status.fm.state === 'running' && status.fm.started_at) {
      const started = new Date(status.fm.started_at).getTime();
      if (currentTime - started > STALE_THRESHOLD_MS) {
        violations.push({ memberId, type: 'STALE_SESSION', detail: `running since ${status.fm.started_at} (>30min)` });
      }
    }
  }

  return violations;
}

const violations = enforce();

const memberCount = fs.existsSync(MEMBERS_DIR)
  ? fs.readdirSync(MEMBERS_DIR, { withFileTypes: true }).filter(d => d.isDirectory()).length
  : 0;

if (violations.length === 0) {
  logToFile(ENFORCE_LOG, `[INFO] No violations found — all ${memberCount} members clean`);
  console.log('ENFORCEMENT PASSED — 0 violations');
  process.exit(0);
} else {
  for (const v of violations) {
    const msg = `${v.memberId} — ${v.type}: ${v.detail}`;
    logToFile(ENFORCE_LOG, `[VIOLATION] ${msg}`);
    console.log(`  VIOLATION: ${msg}`);
  }
  logToFile(ENFORCE_LOG, `[SUMMARY] ${violations.length} violation(s) found`);
  console.log(`ENFORCEMENT FAILED — ${violations.length} violation(s)`);
  process.exit(1);
}
