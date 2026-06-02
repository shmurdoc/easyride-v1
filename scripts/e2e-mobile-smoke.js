#!/usr/bin/env node

const API_BASE = 'http://localhost:8080/api/v1';
const SOCKET_URL = 'http://localhost:13099';

require.cache = {};
const { io } = require('socket.io-client');

async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json', ...(opts.headers || {}) };
  const r = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const text = await r.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  if (!r.ok) {
    const err = new Error(`API ${path} ${r.status}: ${text.slice(0, 200)}`);
    err.status = r.status;
    err.body = body;
    throw err;
  }
  return body;
}

let pass = 0, fail = 0;
function ok(label) { pass++; console.log(`  PASS ${label}`); }
function bad(label, err) { fail++; console.log(`  FAIL ${label}: ${err.message}`); }
async function t(label, fn) {
  try { await fn(); ok(label); } catch (e) { bad(label, e); }
}

async function getToken(email, password) {
  const body = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  return body.token;
}

async function authed(token, path, opts = {}) {
  return api(path, { ...opts, headers: { ...(opts.headers || {}), Authorization: `Bearer ${token}` } });
}

async function main() {
  console.log('=== RIDER FLOW ===');
  let riderToken;
  await t('rider login', async () => {
    riderToken = await getToken('rider@easyryde.com', 'password');
    if (!riderToken) throw new Error('no token');
  });
  await t('rider /auth/me', async () => {
    const me = await authed(riderToken, '/auth/me');
    if (me.email !== 'rider@easyryde.com') throw new Error(`wrong email: ${me.email}`);
  });
  await t('rider places search "phal"', async () => {
    const places = await api('/places/search?q=phal');
    if (!Array.isArray(places.data) || places.data.length === 0) throw new Error('no places');
    if (!places.data[0].lat || !places.data[0].lng) throw new Error('missing coords');
  });
  await t('rider places search "tz"', async () => {
    const places = await api('/places/search?q=tz');
    if (!places.data.some(p => p.name.includes('Tzaneen'))) throw new Error('no Tzaneen');
  });
  await t('rider places search (no auth required)', async () => {
    const places = await api('/places/search?q=mall');
    if (!Array.isArray(places.data)) throw new Error('not array');
  });
  await t('rider wallet fetch', async () => {
    const wallet = await authed(riderToken, '/wallet');
    if (!wallet) throw new Error('no wallet');
  });
  await t('rider ride history fetch', async () => {
    const rides = await authed(riderToken, '/rides');
    if (typeof rides !== 'object') throw new Error('not object');
  });
  await t('rider socket connect', async () => {
    const { io } = require('socket.io-client');
    await new Promise((resolve, reject) => {
      const s = io(SOCKET_URL, { transports: ['websocket'], auth: { token: riderToken }, reconnection: false });
      const t = setTimeout(() => { s.close(); reject(new Error('timeout')); }, 5000);
      s.on('connect', () => { clearTimeout(t); s.close(); resolve(); });
      s.on('connect_error', (e) => { clearTimeout(t); s.close(); reject(new Error(e.message)); });
    });
  });

  console.log('\n=== DRIVER FLOW ===');
  let driverToken;
  await t('driver login', async () => {
    driverToken = await getToken('driver@easyryde.com', 'password');
  });
  await t('driver /auth/me', async () => {
    const me = await authed(driverToken, '/auth/me');
    if (me.role !== 'driver') throw new Error(`wrong role: ${me.role}`);
  });
  await t('driver profile', async () => {
    const drivers = await authed(driverToken, '/drivers');
    if (!Array.isArray(drivers.data)) throw new Error('not array');
  });
  await t('driver earnings', async () => {
    const earnings = await authed(driverToken, '/drivers/earnings');
    if (!earnings) throw new Error('no earnings');
  });
  await t('driver toggle online', async () => {
    const r = await authed(driverToken, '/drivers/toggle-online', { method: 'POST' });
    if (!r) throw new Error('no response');
  });
  await t('driver socket connect', async () => {
    const { io } = require('socket.io-client');
    await new Promise((resolve, reject) => {
      const s = io(SOCKET_URL, { transports: ['websocket'], auth: { token: driverToken }, reconnection: false });
      const t = setTimeout(() => { s.close(); reject(new Error('timeout')); }, 5000);
      s.on('connect', () => { clearTimeout(t); s.close(); resolve(); });
      s.on('connect_error', (e) => { clearTimeout(t); s.close(); reject(new Error(e.message)); });
    });
  });

  console.log('\n=== ADMIN FLOW ===');
  let adminToken;
  await t('admin login', async () => {
    adminToken = await getToken('admin@easyryde.com', 'password');
  });
  await t('admin /auth/me', async () => {
    const me = await authed(adminToken, '/auth/me');
    if (me.role !== 'admin') throw new Error(`wrong role: ${me.role}`);
  });
  await t('admin dashboard stats', async () => {
    const d = await authed(adminToken, '/admin/dashboard');
    if (typeof d.total_rides !== 'number') throw new Error('total_rides missing');
  });
  await t('admin list drivers', async () => {
    const drivers = await authed(adminToken, '/admin/drivers?per_page=10');
    if (!Array.isArray(drivers.data)) throw new Error('not array');
  });
  await t('admin list rides', async () => {
    const rides = await authed(adminToken, '/admin/rides?per_page=10');
    if (!Array.isArray(rides.data)) throw new Error('not array');
  });
  await t('admin list users', async () => {
    const users = await authed(adminToken, '/admin/users?per_page=10');
    if (!Array.isArray(users.data)) throw new Error('not array');
  });
  await t('admin socket connect', async () => {
    const { io } = require('socket.io-client');
    await new Promise((resolve, reject) => {
      const s = io(SOCKET_URL, { transports: ['websocket'], auth: { token: adminToken }, reconnection: false });
      const t = setTimeout(() => { s.close(); reject(new Error('timeout')); }, 5000);
      s.on('connect', () => { clearTimeout(t); s.close(); resolve(); });
      s.on('connect_error', (e) => { clearTimeout(t); s.close(); reject(new Error(e.message)); });
    });
  });

  console.log(`\n=== RESULTS: ${pass} pass, ${fail} fail ===`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => { console.error('FATAL', e); process.exit(2); });
