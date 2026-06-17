import { WebSocket } from 'k6/experimental/websockets';
import { check, sleep } from 'k6';

export const options = {
  thresholds: {
    ws_connecting: ['p(95)<200'],
  },
  vus: 1000,
  duration: '5m',
};

export default function () {
  const url = `wss://${__ENV.SOCKET_HOST || 'localhost:6001'}/app/${__ENV.SOCKET_KEY || 'test-key'}`;
  const ws = new WebSocket(url);

  ws.onopen = () => {
    check(ws, { 'connected': true });
    ws.send(JSON.stringify({ event: 'client:ping' }));
  };

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    check(msg, { 'received pong': (m) => m.event === 'server:pong' });
  };

  ws.onerror = (e) => {
    console.error('WebSocket error:', e);
  };

  ws.onclose = () => {
    console.log('WebSocket closed');
  };

  sleep(5);
  ws.close();
}
