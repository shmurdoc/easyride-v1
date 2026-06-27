import http from 'k6/http';
import { check, sleep, group } from 'k6';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_duration: ['max<10000'],
    http_req_failed: ['rate<0.5'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export default function () {
  group('public endpoints', function () {
    let res = http.get(`${BASE_URL}/api/v1/health`);
    check(res, { 'health': (r) => r.status === 200 });

    res = http.get(`${BASE_URL}/api/v1/config`);
    check(res, { 'config': (r) => r.status === 200 });

    res = http.get(`${BASE_URL}/api/v1/places/search?q=Sandton`);
    check(res, { 'places search': (r) => r.status === 200 });

    res = http.get(`${BASE_URL}/api/v1/rides/fare-estimate?pickup_lat=-26.2041&pickup_lng=28.0473&dropoff_lat=-26.1076&dropoff_lng=28.0567`);
    check(res, { 'fare estimate': (r) => r.status === 200 });
  });

  sleep(1);

  const email = `smoke_${Date.now()}@example.com`;
  let token;

  group('auth flow', function () {
    let res = http.post(`${BASE_URL}/api/v1/auth/register`, JSON.stringify({
      name: 'Smoke Test',
      email: email,
      password: 'TestPass123!',
      password_confirmation: 'TestPass123!',
      phone_number: '+27710000001',
    }), { headers: { 'Content-Type': 'application/json' } });

    token = res.json('data.token');
    check(res, { 'register': (r) => r.status === 201 && token !== undefined });

    res = http.post(`${BASE_URL}/api/v1/auth/login`, JSON.stringify({
      email: email, password: 'TestPass123!',
    }), { headers: { 'Content-Type': 'application/json' } });

    check(res, { 'login': (r) => r.status === 200 });
  });

  sleep(1);

  let auth = { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } };

  group('authenticated endpoints', function () {
    let res = http.get(`${BASE_URL}/api/v1/auth/me`, auth);
    check(res, { 'auth/me': (r) => r.status === 200 });

    res = http.get(`${BASE_URL}/api/v1/users`, auth);
    check(res, { 'list users': (r) => r.status === 200 });

    res = http.get(`${BASE_URL}/api/v1/notifications/unread-count`, auth);
    check(res, { 'notifications': (r) => r.status === 200 });

    res = http.get(`${BASE_URL}/api/v1/wallet`, auth);
    check(res, { 'wallet': (r) => r.status === 200 });
  });

  sleep(1);

  group('ride + payment flow', function () {
    let res = http.post(`${BASE_URL}/api/v1/rides`, JSON.stringify({
      pickup_latitude: -26.2041, pickup_longitude: 28.0473,
      dropoff_latitude: -26.1076, dropoff_longitude: 28.0567,
      pickup_address: 'Sandton City', dropoff_address: 'OR Tambo Airport',
      category: 'standard',
    }), auth);
    check(res, { 'create ride': (r) => r.status === 200 });

    res = http.get(`${BASE_URL}/api/v1/payments/methods`, auth);
    check(res, { 'payment methods': (r) => r.status === 200 });
  });
}
