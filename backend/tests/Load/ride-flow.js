import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { SharedArray } from 'k6/data';

export const options = {
  stages: [
    { duration: '10s', target: 2 },
    { duration: '30s', target: 5 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000', 'avg<1000'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export default function () {
  const email = `rideload_${__VU}_${Date.now()}@example.com`;
  const password = 'TestPass123!';

  let token;

  group('register and login', function () {
    let res = http.post(`${BASE_URL}/api/v1/auth/register`, JSON.stringify({
      name: `Ride Test ${__VU}`,
      email: email,
      password: password,
      password_confirmation: password,
      phone_number: `+277${__VU}1000001`,
    }), { headers: { 'Content-Type': 'application/json' } });

    token = res.json('data.token');

    check(res, { 'register status 201': (r) => r.status === 201 });
  });

  sleep(1);

  let authHeaders = { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } };

  group('create ride', function () {
    const res = http.post(`${BASE_URL}/api/v1/rides`, JSON.stringify({
      pickup_latitude: -26.2041,
      pickup_longitude: 28.0473,
      dropoff_latitude: -26.1076,
      dropoff_longitude: 28.0567,
      pickup_address: 'Sandton City',
      dropoff_address: 'OR Tambo Airport',
      category: 'standard',
    }), authHeaders);

    check(res, {
      'create ride status 200': (r) => r.status === 200,
      'ride has id': (r) => r.json('data.id') !== undefined,
    });
  });

  sleep(1);

  group('get ride history', function () {
    const res = http.get(`${BASE_URL}/api/v1/rides`, authHeaders);
    check(res, {
      'ride history status 200': (r) => r.status === 200,
      'ride history is array': (r) => Array.isArray(r.json('data')),
    });
  });

  sleep(1);

  group('get config', function () {
    const res = http.get(`${BASE_URL}/api/v1/config`);
    check(res, { 'config status 200': (r) => r.status === 200 });
  });
}
