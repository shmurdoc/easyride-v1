import http from 'k6/http';
import { check } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export const options = {
  vus: 1,
  iterations: 5,
  thresholds: {
    errors: ['rate<0'],
  },
};

export default function () {
  const noAuth = http.get(`${BASE_URL}/api/v1/auth/me`);
  check(noAuth, { 'no token → 401': (r) => r.status === 401 });
  errorRate.add(noAuth.status !== 401);

  const badToken = http.get(`${BASE_URL}/api/v1/auth/me`, {
    headers: { Authorization: 'Bearer invalid-token-here' },
  });
  check(badToken, { 'invalid token → 401': (r) => r.status === 401 });
  errorRate.add(badToken.status !== 401);

  const expiredToken = http.get(`${BASE_URL}/api/v1/auth/me`, {
    headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dkjf' },
  });
  check(expiredToken, { 'expired token → 401': (r) => r.status === 401 });
  errorRate.add(expiredToken.status !== 401);

  const emptyToken = http.get(`${BASE_URL}/api/v1/auth/me`, {
    headers: { Authorization: 'Bearer ' },
  });
  check(emptyToken, { 'empty token → 401': (r) => r.status === 401 });
  errorRate.add(emptyToken.status !== 401);

  const wrongScheme = http.get(`${BASE_URL}/api/v1/auth/me`, {
    headers: { Authorization: 'Basic dGVzdDpwYXNz' },
  });
  check(wrongScheme, { 'wrong scheme → 401': (r) => r.status === 401 });
  errorRate.add(wrongScheme.status !== 401);
}
