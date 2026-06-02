const { io } = require('socket.io-client');

async function getToken() {
  const r = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email: 'admin@easyryde.com', password: 'password' }),
  });
  const body = await r.json();
  return body.token;
}

async function test() {
  const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:13099';
  console.log('1) No token (should fail)');
  await new Promise((resolve) => {
    const s = io(SOCKET_URL, { transports: ['websocket'], reconnection: false });
    s.on('connect_error', (e) => { console.log('   ->', e.message); s.close(); resolve(); });
    setTimeout(() => { s.close(); resolve(); }, 1500);
  });

  console.log('2) Garbage token (should fail)');
  await new Promise((resolve) => {
    const s = io(SOCKET_URL, { transports: ['websocket'], auth: { token: 'not-a-real-token' }, reconnection: false });
    s.on('connect_error', (e) => { console.log('   ->', e.message); s.close(); resolve(); });
    setTimeout(() => { s.close(); resolve(); }, 1500);
  });

  console.log('3) Real Sanctum token (should succeed)');
  const token = await getToken();
  console.log('   token prefix:', token.substring(0, 20) + '...');
  await new Promise((resolve) => {
    const s = io(SOCKET_URL, { transports: ['websocket'], auth: { token }, reconnection: false });
    s.on('connect', () => { console.log('   -> CONNECTED'); s.close(); resolve(); });
    s.on('connect_error', (e) => { console.log('   ->', e.message); s.close(); resolve(); });
    setTimeout(() => { s.close(); resolve(); }, 3000);
  });
}

test().catch((e) => { console.error(e); process.exit(1); });
