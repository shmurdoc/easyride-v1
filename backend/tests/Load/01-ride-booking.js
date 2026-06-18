import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
const rideCreateTrend = new Trend('ride_create_duration');
const rideFailureRate = new Rate('ride_failure_rate');

export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '2m', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    ride_create_duration: ['p(95)<3000'],
    ride_failure_rate: ['rate<0.1'],
    http_req_duration: ['p(95)<2000'],
  },
};

function getAuthToken() {
  const res = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'rider@easyryde.com',
    password: 'password',
  }), { headers: { 'Content-Type': 'application/json' } });

  if (res.status !== 200) {
    console.error('Auth failed:', res.status, res.body);
    return null;
  }
  return JSON.parse(res.body).token;
}

export default function () {
  group('Ride Booking Flow', () => {
    const token = getAuthToken();
    if (!token) {
      rideFailureRate.add(1);
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const pickupLat = -23.94 + (Math.random() - 0.5) * 0.02;
    const pickupLng = 29.47 + (Math.random() - 0.5) * 0.02;

    const rideRes = http.post(`${BASE_URL}/api/v1/rides`, JSON.stringify({
      pickup_latitude: pickupLat,
      pickup_longitude: pickupLng,
      dropoff_latitude: -23.95,
      dropoff_longitude: 29.48,
      category: 'standard',
    }), { headers });

    check(rideRes, {
      'ride created successfully': (r) => r.status === 201,
      'ride has id': (r) => JSON.parse(r.body).data?.id !== undefined,
    });

    rideCreateTrend.add(rideRes.timings.duration);
    rideFailureRate.add(rideRes.status !== 201);

    if (rideRes.status === 201) {
      const rideId = JSON.parse(rideRes.body).data.id;
      http.get(`${BASE_URL}/api/v1/rides/${rideId}`, { headers });
    }

    sleep(1);
  });
}
