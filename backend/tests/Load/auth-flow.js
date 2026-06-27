import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { SharedArray } from 'k6/data';

export const options = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '30s', target: 10 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000', 'avg<800'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export default function () {
  const email = `loadtest_${__VU}_${Date.now()}@example.com`;
  const password = 'TestPass123!';

  group('register', function () {
    const res = http.post(`${BASE_URL}/api/v1/auth/register`, JSON.stringify({
      name: `Test User ${__VU}`,
      email: email,
      password: password,
      password_confirmation: password,
      phone_number: `+277${__VU}0000001`,
    }), { headers: { 'Content-Type': 'application/json' } });

    check(res, {
      'register status 201': (r) => r.status === 201,
      'register has token': (r) => r.json('data.token') !== undefined,
    });
  });

  sleep(1);

  group('login', function () {
    const res = http.post(`${BASE_URL}/api/v1/auth/login`, JSON.stringify({
      email: email,
      password: password,
    }), { headers: { 'Content-Type': 'application/json' } });

    check(res, {
      'login status 200': (r) => r.status === 200,
      'login has token': (r) => r.json('data.token') !== undefined,
    });
  });

  sleep(1);
}
