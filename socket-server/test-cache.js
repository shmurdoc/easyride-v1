const { io } = require('socket.io-client');
const TOKEN = process.argv[2];

async function t(n) {
  for (let i = 0; i < n; i++) {
    await new Promise((resolve) => {
      const s = io('http://localhost:13099', { transports: ['websocket'], auth: { token: TOKEN }, reconnection: false });
      s.on('connect', () => { console.log(`conn ${i} OK`); s.close(); resolve(); });
      s.on('connect_error', (e) => { console.log(`conn ${i} ERR: ${e.message}`); s.close(); resolve(); });
      setTimeout(() => { s.close(); resolve(); }, 1500);
    });
    await new Promise((r) => setTimeout(r, 100));
  }
}

t(3).then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
