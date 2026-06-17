import http from 'k6/http';
import { check } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

const payloads = [
  "' OR 1=1--",
  "'; DROP TABLE users; --",
  "' UNION SELECT * FROM users--",
  "<script>alert('xss')</script>",
  "../../../etc/passwd",
  "' OR '1'='1",
  "admin'--",
  "1; SELECT * FROM admins",
  "' OR 1=1 #",
  "' OR 'x'='x",
];

export const options = {
  vus: 1,
  iterations: payloads.length,
  thresholds: {
    errors: ['rate<0'],
  },
};

export default function () {
  const payload = payloads[(__ITER) % payloads.length];

  const res = http.post(`${BASE_URL}/api/v1/auth/login`, {
    email: payload,
    password: 'password',
  });

  check(res, {
    [`No SQL error for payload index ${__ITER}`]: (r) =>
      r.status !== 500 && !r.body.includes('SQL') && !r.body.includes('PDO') && !r.body.includes('syntax error'),
  });

  errorRate.add(
    res.status === 500 ||
      r.body.includes('SQL') ||
      r.body.includes('PDO') ||
      r.body.includes('syntax error'),
  );
}
