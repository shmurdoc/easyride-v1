const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const PORT = 8086;
const PROJECT_DIR = path.resolve(__dirname, 'mobile/apps/rider');
const EXPO_CMD = path.resolve(PROJECT_DIR, 'node_modules/.bin/expo.cmd');

const proc = spawn('cmd.exe', ['/c', EXPO_CMD, 'start', '--dev-client', '--port', String(PORT)], {
  cwd: PROJECT_DIR,
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, PATH: `C:\\Users\\madoc\\AppData\\Local\\nvm\\v22.16.0;${process.env.PATH}` }
});

let output = '';
proc.stdout.on('data', d => { const s = d.toString(); output += s; process.stdout.write(s); });
proc.stderr.on('data', d => { const s = d.toString(); output += s; process.stderr.write(s); });

function waitForMetro(retries) {
  return new Promise((resolve, reject) => {
    function check() {
      const req = http.get(`http://localhost:${PORT}/status`, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
      req.on('error', () => {
        if (retries-- > 0) setTimeout(check, 2000);
        else reject(new Error('Metro did not start'));
      });
      req.setTimeout(3000, () => { req.destroy(); if (retries-- > 0) setTimeout(check, 200); else reject(new Error('Metro timeout')); });
    }
    check();
  });
}

async function requestBundle() {
  return new Promise((resolve, reject) => {
    const url = `http://localhost:${PORT}/node_modules/expo/AppEntry.bundle?platform=android&dev=true&minify=false`;
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data.substring(0, 2000) }));
    }).on('error', reject);
  });
}

(async () => {
  try {
    console.log('Waiting for Metro...');
    const status = await waitForMetro(45);
    console.log('Metro status:', status);
    console.log('Requesting bundle...');
    const result = await requestBundle();
    console.log('Bundle status:', result.status);
    console.log('Bundle body (first 2000):', result.body);
  } catch (err) {
    console.error('Error:', err.message);
    console.error('Full output:', output);
  } finally {
    proc.kill();
  }
})();
