import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export const options = {
  scenarios: {
    rapid_requests: {
      executor: 'constant-arrival-rate',
      rate: 100,
      timeUnit: '1s',
      duration: '10s',
      preAllocatedVUs: 20,
    },
  },
  thresholds: {
    errors: ['rate<0.90'],
    http_req_duration: ['p(95)<2000'],
  },
};

export default function () {
  const spoofedIps = [
    '',
    '127.0.0.1',
    '10.0.0.1',
    '192.168.1.1',
    '127.0.0.1, 10.0.0.1',
    '0.0.0.0',
  ];

  const ip = spoofedIps[__ITER % spoofedIps.length];

  const res = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    {
      email: `test${__VU}_${Date.now()}@example.com`,
      password: 'wrong',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': ip,
        'X-Real-IP': ip,
        'X-Forwarded-Host': 'evil.com',
      },
    },
  );

  check(res, {
    'rate limited or handled gracefully': (r) =>
      r.status === 429 || r.status === 422 || r.status === 401,
  });

  errorRate.add(![429, 422, 401].includes(res.status));
  sleep(0.1);
}
