import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { BASE_URL } from './options.js';

const errorRate = new Rate('errors');

export const options = {
  scenarios: {
    admin_browsing: {
      executor: 'constant-vus',
      vus: 50,
      duration: '5m',
    },
  },
  thresholds: {
    errors: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
};

const ADMIN_TOKEN = __ENV.ADMIN_TOKEN || 'admin-test-token';

const endpoints = [
  '/api/v1/admin/dashboard',
  '/api/v1/admin/rides?per_page=20',
  '/api/v1/admin/drivers?per_page=20',
  '/api/v1/admin/reports/revenue',
  '/api/v1/admin/reports/rides',
  '/api/v1/admin/payouts?per_page=20',
  '/api/v1/admin/audit-logs?per_page=20',
  '/api/v1/admin/food/orders?per_page=20',
];

export default function () {
  const url = `${BASE_URL}${endpoints[Math.floor(Math.random() * endpoints.length)]}`;

  const res = http.get(url, {
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 1s': (r) => r.timings.duration < 1000,
  });

  errorRate.add(res.status !== 200);
  sleep(3);
}
