import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const rideDuration = new Trend('ride_creation_duration');
const loginDuration = new Trend('login_duration');

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    errors: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000/api/v1';

let authToken;

function login() {
  const payload = JSON.stringify({
    email: 'test@example.com',
    password: 'Password1!',
  });

  const params = { headers: { 'Content-Type': 'application/json' } };
  const res = http.post(`${BASE_URL}/auth/login`, payload, params);

  loginDuration.add(res.timings.duration);

  check(res, {
    'login status is 200': (r) => r.status === 200,
    'login returns token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.token !== undefined;
      } catch {
        return false;
      }
    },
  });

  if (res.status === 200) {
    try {
      const body = JSON.parse(res.body);
      authToken = body.token;
    } catch {
      authToken = null;
    }
  }

  errorRate.add(res.status !== 200);
}

function createRide() {
  const payload = JSON.stringify({
    pickup_latitude: -23.9468,
    pickup_longitude: 29.4726,
    pickup_address: 'Phalaborwa CBD',
    dropoff_latitude: -23.9500,
    dropoff_longitude: 29.4800,
    dropoff_address: 'Phalaborwa Airport',
    category: 'standard',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  };

  const res = http.post(`${BASE_URL}/rides`, payload, params);
  rideDuration.add(res.timings.duration);

  check(res, {
    'ride creation status is 201': (r) => r.status === 201,
    'ride has id': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.ride && body.ride.id !== undefined;
      } catch {
        return false;
      }
    },
  });

  errorRate.add(res.status !== 201);
}

function getRideHistory() {
  const params = {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };

  const res = http.get(`${BASE_URL}/rides`, params);

  check(res, {
    'ride history status is 200': (r) => r.status === 200,
  });

  errorRate.add(res.status !== 200);
}

function getWalletBalance() {
  const params = {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };

  const res = http.get(`${BASE_URL}/wallet`, params);

  check(res, {
    'wallet status is 200': (r) => r.status === 200,
  });

  errorRate.add(res.status !== 200);
}

function getNotifications() {
  const params = {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };

  const res = http.get(`${BASE_URL}/notifications`, params);

  check(res, {
    'notifications status is 200': (r) => r.status === 200,
  });

  errorRate.add(res.status !== 200);
}

export default function () {
  login();

  if (!authToken) {
    sleep(1);
    return;
  }

  createRide();
  sleep(0.5);

  getRideHistory();
  sleep(0.5);

  getWalletBalance();
  sleep(0.5);

  getNotifications();
  sleep(1);
}
