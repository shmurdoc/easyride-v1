import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
const mixedTrend = new Trend('mixed_request_duration');
const mixedRate = new Rate('mixed_success_rate');

export const options = {
  stages: [
    { duration: '1m', target: 20 },
    { duration: '2m', target: 80 },
    { duration: '2m', target: 200 },
    { duration: '2m', target: 200 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    mixed_request_duration: ['p(95)<3000'],
    http_req_duration: ['p(95)<2500'],
    http_req_failed: ['rate<0.15'],
  },
};

const USERS = [
  { email: 'admin@easyryde.com', password: 'password', role: 'admin' },
  { email: 'driver@easyryde.com', password: 'password', role: 'driver' },
  { email: 'rider@easyryde.com', password: 'password', role: 'rider' },
];

export default function () {
  const user = USERS[__VU % USERS.length];

  group(`${user.role} workload`, () => {
    const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
      email: user.email,
      password: user.password,
    }), { headers: { 'Content-Type': 'application/json' } });

    if (loginRes.status !== 200) {
      mixedRate.add(0);
      return;
    }

    const token = JSON.parse(loginRes.body).token;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    if (user.role === 'admin') {
      http.get(`${BASE_URL}/api/v1/admin/dashboard`, { headers });
      http.get(`${BASE_URL}/api/v1/admin/users`, { headers });
      http.get(`${BASE_URL}/api/v1/admin/rides`, { headers });
    } else if (user.role === 'driver') {
      http.post(`${BASE_URL}/api/v1/drivers/location`, JSON.stringify({
        latitude: -23.94 + Math.random() * 0.04,
        longitude: 29.47 + Math.random() * 0.04,
        heading: Math.random() * 360,
        speed: 40 + Math.random() * 30,
      }), { headers });
      http.get(`${BASE_URL}/api/v1/drivers/nearby-rides`, { headers });
      http.get(`${BASE_URL}/api/v1/drivers/earnings`, { headers });
    } else {
      const rideRes = http.post(`${BASE_URL}/api/v1/rides`, JSON.stringify({
        pickup_latitude: -23.94 + Math.random() * 0.02,
        pickup_longitude: 29.47 + Math.random() * 0.02,
        dropoff_latitude: -23.95,
        dropoff_longitude: 29.48,
        category: 'standard',
      }), { headers });

      if (rideRes.status === 201) {
        const rideId = JSON.parse(rideRes.body).data?.id;
        if (rideId) {
          http.get(`${BASE_URL}/api/v1/rides/${rideId}`, { headers });
        }
      }

      http.get(`${BASE_URL}/api/v1/notifications`, { headers });
      http.get(`${BASE_URL}/api/v1/referrals/my-code`, { headers });
    }

    mixedRate.add(1);
    sleep(1);
  });
}
