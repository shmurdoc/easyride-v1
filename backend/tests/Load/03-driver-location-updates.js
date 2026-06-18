import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
const locationTrend = new Trend('location_update_duration');
const locationRate = new Rate('location_update_rate');

export const options = {
  stages: [
    { duration: '1m', target: 30 },
    { duration: '2m', target: 150 },
    { duration: '1m', target: 300 },
    { duration: '2m', target: 300 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    location_update_duration: ['p(95)<1000'],
    http_req_duration: ['p(95)<1500'],
  },
};

function getDriverToken() {
  const res = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'driver@easyryde.com',
    password: 'password',
  }), { headers: { 'Content-Type': 'application/json' } });

  if (res.status !== 200) return null;
  return JSON.parse(res.body).token;
}

export default function () {
  group('Driver Location Updates', () => {
    const token = getDriverToken();
    if (!token) return;

    const lat = -23.94 + (Math.random() - 0.5) * 0.05;
    const lng = 29.47 + (Math.random() - 0.5) * 0.05;

    for (let i = 0; i < 5; i++) {
      const res = http.post(`${BASE_URL}/api/v1/drivers/location`, JSON.stringify({
        latitude: lat + i * 0.001,
        longitude: lng + i * 0.001,
        heading: Math.random() * 360,
        speed: 30 + Math.random() * 40,
      }), {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      check(res, {
        'location updated': (r) => r.status === 200,
      });

      locationTrend.add(res.timings.duration);
      locationRate.add(res.status === 200 ? 1 : 0);
      sleep(1);
    }
  });
}
