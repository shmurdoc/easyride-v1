import http from 'k6/http';
import { check } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export const options = {
  vus: 1,
  iterations: 4,
  thresholds: {
    errors: ['rate<0'],
  },
};

export default function () {
  const withoutOrigin = http.post(
    `${BASE_URL}/api/v1/rides`,
    JSON.stringify({ pickup_address: 'Test' }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
  check(withoutOrigin, { 'missing origin rejects ride': (r) => r.status !== 201 });
  errorRate.add(withoutOrigin.status === 201);

  const withSpoofedOrigin = http.post(
    `${BASE_URL}/api/v1/rides`,
    JSON.stringify({ pickup_address: 'Test' }),
    {
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://evil.com',
        Referer: 'https://evil.com/hack',
      },
    },
  );
  check(withSpoofedOrigin, { 'spoofed origin rejects ride': (r) => r.status !== 201 });
  errorRate.add(withSpoofedOrigin.status === 201);

  const stateChangingGet = http.get(`${BASE_URL}/api/v1/admin/drivers/any-id/approve`);
  check(stateChangingGet, { 'GET on state change is blocked': (r) => r.status >= 400 });
  errorRate.add(stateChangingGet.status < 400);
}
