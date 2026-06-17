#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEAM_DIR = path.resolve(__dirname, '..');
const MEMBERS_DIR = path.join(TEAM_DIR, 'members');
const CONFIG_PATH = path.join(TEAM_DIR, 'team.config.json');

const REQUIRED_MEMBER_FILES = ['plan.md', 'instruction.md', 'status.md', 'wait.md'];

const PLAN_SCHEMA = {
  required: ['member_id', 'ticket', 'status', 'lock'],
  state_values: ['idle', 'running', 'done', 'blocked'],
  priority_values: ['low', 'medium', 'high', 'critical']
};

const STATUS_SCHEMA = {
  required: ['member_id', 'state', 'lock', 'current_progress', 'started_at', 'completed_at', 'blocked_reason', 'updated_by', 'updated_at'],
  state_values: ['idle', 'running', 'done', 'blocked']
};

const WAIT_SCHEMA = {
  required: ['member_id', 'waiting_on', 'blocked_by', 'updated_by', 'updated_at']
};

const INSTRUCTION_SCHEMA = {
  required: ['project', 'purpose', 'member_id', 'type', 'owner', 'version', 'last_updated', 'updated_by']
};

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
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

function checkFields(fm, schema, filePath, errors, warnings) {
  for (const field of schema.required) {
    if (!(field in fm)) {
      errors.push(`${filePath}: missing required field "${field}"`);
    }
  }
  if (schema.state_values && 'state' in fm) {
    if (!schema.state_values.includes(fm.state)) {
      errors.push(`${filePath}: invalid state "${fm.state}" — must be one of: ${schema.state_values.join(', ')}`);
    }
  }
  if (schema.state_values && 'status' in fm) {
    if (!schema.state_values.includes(fm.status)) {
      errors.push(`${filePath}: invalid status "${fm.status}" — must be one of: ${schema.state_values.join(', ')}`);
    }
  }
  if ('lock' in fm && typeof fm.lock !== 'boolean') {
    errors.push(`${filePath}: "lock" must be boolean, got ${typeof fm.lock}`);
  }
  if ('strict_scope' in fm && typeof fm.strict_scope !== 'boolean') {
    errors.push(`${filePath}: "strict_scope" must be boolean, got ${typeof fm.strict_scope}`);
  }
  if ('review_required' in fm && typeof fm.review_required !== 'boolean') {
    errors.push(`${filePath}: "review_required" must be boolean, got ${typeof fm.review_required}`);
  }
  if (schema.priority_values && 'priority' in fm) {
    if (!schema.priority_values.includes(fm.priority)) {
      warnings.push(`${filePath}: unusual priority "${fm.priority}" — expected one of: ${schema.priority_values.join(', ')}`);
    }
  }
}

function validate() {
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(CONFIG_PATH)) {
    errors.push(`team.config.json not found at ${CONFIG_PATH}`);
  } else {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    if (!config.members || !Array.isArray(config.members)) {
      errors.push('team.config.json: missing or invalid "members" array');
    }
    if (!config.project || !config.project.name) {
      errors.push('team.config.json: missing "project.name"');
    }
    if (config.members) {
      const ids = config.members.map(m => m.id);
      const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
      if (dupes.length > 0) {
        errors.push(`team.config.json: duplicate member IDs: ${[...new Set(dupes)].join(', ')}`);
      }
    }
  }

  if (!fs.existsSync(MEMBERS_DIR)) {
    errors.push(`Members directory not found at ${MEMBERS_DIR}`);
    return { errors, warnings };
  }

  const memberDirs = fs.readdirSync(MEMBERS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const configIds = new Set();
  if (fs.existsSync(CONFIG_PATH)) {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    if (config.members) config.members.forEach(m => configIds.add(m.id));
  }

  for (const memberId of memberDirs) {
    const memberDir = path.join(MEMBERS_DIR, memberId);

    if (!configIds.has(memberId)) {
      warnings.push(`${memberId}: directory exists but not registered in team.config.json`);
    }

    for (const fileName of REQUIRED_MEMBER_FILES) {
      const filePath = path.join(memberDir, fileName);
      if (!fs.existsSync(filePath)) {
        errors.push(`${filePath}: missing required file`);
        continue;
      }
      const content = fs.readFileSync(filePath, 'utf8');
      const fm = parseFrontmatter(content);
      if (!fm) {
        errors.push(`${filePath}: missing or invalid YAML frontmatter (must start with ---)`);
        continue;
      }

      if (fm.member_id && fm.member_id !== memberId) {
        errors.push(`${filePath}: member_id "${fm.member_id}" doesn't match directory name "${memberId}"`);
      }

      switch (fileName) {
        case 'plan.md':
          checkFields(fm, PLAN_SCHEMA, filePath, errors, warnings);
          break;
        case 'status.md':
          checkFields(fm, STATUS_SCHEMA, filePath, errors, warnings);
          break;
        case 'wait.md':
          checkFields(fm, WAIT_SCHEMA, filePath, errors, warnings);
          break;
        case 'instruction.md':
          checkFields(fm, INSTRUCTION_SCHEMA, filePath, errors, warnings);
          break;
      }
    }
  }

  for (const configId of configIds) {
    if (!memberDirs.includes(configId)) {
      warnings.push(`${configId}: registered in team.config.json but no directory exists`);
    }
  }

  return { errors, warnings };
}

const result = validate();
const memberCount = fs.existsSync(MEMBERS_DIR)
  ? fs.readdirSync(MEMBERS_DIR, { withFileTypes: true }).filter(d => d.isDirectory()).length
  : 0;

if (result.errors.length === 0) {
  if (result.warnings.length === 0) {
    console.log(`VALIDATION PASSED — ${memberCount} members, ${memberCount * REQUIRED_MEMBER_FILES.length} files, 0 errors, 0 warnings`);
  } else {
    console.log(`VALIDATION PASSED with warnings — ${result.warnings.length} warning(s)`);
    for (const w of result.warnings) {
      console.log(`  WARN: ${w}`);
    }
  }
  process.exit(0);
} else {
  console.log(`VALIDATION FAILED — ${result.errors.length} error(s), ${result.warnings.length} warning(s)`);
  for (const e of result.errors) {
    console.log(`  ERROR: ${e}`);
  }
  for (const w of result.warnings) {
    console.log(`  WARN: ${w}`);
  }
  process.exit(1);
}
