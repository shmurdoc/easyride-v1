import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import ws from 'k6/ws';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
const WS_URL = __ENV.WS_URL || 'ws://localhost:8080';
const connectRate = new Rate('ws_connect_success');
const connectDuration = new Trend('ws_connect_duration');

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 200 },
    { duration: '1m', target: 200 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    ws_connect_success: ['rate>0.95'],
    ws_connect_duration: ['p(95)<2000'],
  },
};

export default function () {
  group('WebSocket Connection', () => {
    const start = Date.now();
    const res = ws.connect(WS_URL, {}, function (socket) {
      socket.on('open', () => {
        const duration = Date.now() - start;
        connectDuration.add(duration);
        connectRate.add(1);

        socket.send(JSON.stringify({
          event: 'auth',
          token: 'load-test-token',
        }));

        socket.send(JSON.stringify({
          event: 'driver:location_update',
          data: { lat: -23.9468, lng: 29.4726 },
        }));

        socket.close();
      });

      socket.on('error', () => {
        connectRate.add(0);
      });
    });

    check(res, {
      'websocket connected': (r) => r && r.status === 101,
    });

    sleep(0.5);
  });
}
