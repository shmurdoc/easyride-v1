import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
const dashboardTrend = new Trend('dashboard_load_duration');
const dashboardRate = new Rate('dashboard_success_rate');

export const options = {
  stages: [
    { duration: '30s', target: 5 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 50 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    dashboard_load_duration: ['p(95)<2000'],
    http_req_duration: ['p(95)<1500'],
  },
};

function getAdminToken() {
  const res = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'admin@easyryde.com',
    password: 'password',
  }), { headers: { 'Content-Type': 'application/json' } });

  if (res.status !== 200) return null;
  return JSON.parse(res.body).token;
}

export default function () {
  group('Admin Dashboard', () => {
    const token = getAdminToken();
    if (!token) return;

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const endpoints = [
      '/api/v1/admin/dashboard',
      '/api/v1/admin/users',
      '/api/v1/admin/rides',
      '/api/v1/admin/drivers',
      '/api/v1/payments',
      '/api/v1/rides',
    ];

    for (const endpoint of endpoints) {
      const res = http.get(`${BASE_URL}${endpoint}`, { headers });

      check(res, {
        [`${endpoint} loaded`]: (r) => r.status === 200,
      });

      dashboardTrend.add(res.timings.duration);
      dashboardRate.add(res.status === 200 ? 1 : 0);

      sleep(0.3);
    }
  });
}
