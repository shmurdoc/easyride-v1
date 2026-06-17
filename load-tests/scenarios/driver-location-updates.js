import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  scenarios: {
    driver_updates: {
      executor: 'per-vu-iterations',
      vus: 500,
      iterations: 60,
      maxDuration: '5m',
    },
  },
  thresholds: {
    errors: ['rate<0.05'],
    http_req_duration: ['p(95)<200'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export default function () {
  const driverId = `driver-${__VU}`;
  const payload = JSON.stringify({
    latitude: -23.94 + (Math.random() - 0.5) * 0.05,
    longitude: 29.47 + (Math.random() - 0.5) * 0.05,
    is_online: true,
    heading: Math.floor(Math.random() * 360),
    speed: Math.floor(Math.random() * 60),
  });

  const res = http.put(
    `${BASE_URL}/api/v1/drivers/${driverId}/location`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${__ENV.DRIVER_TOKEN || 'test-token'}`,
      },
    },
  );

  check(res, {
    'location update accepted': (r) => r.status === 200,
  });

  errorRate.add(res.status !== 200);
  sleep(5);
}
