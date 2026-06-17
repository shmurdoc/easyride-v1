import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { BASE_URL } from './options.js';

const errorRate = new Rate('errors');

export const options = {
  scenarios: {
    ride_booking: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '2m', target: 30 },
        { duration: '5m', target: 60 },
        { duration: '2m', target: 0 },
      ],
      exec: 'rideBooking',
    },
    driver_location: {
      executor: 'constant-vus',
      vus: 100,
      duration: '5m',
      exec: 'driverLocationUpdate',
      startTime: '30s',
    },
    admin_browsing: {
      executor: 'constant-vus',
      vus: 20,
      duration: '5m',
      exec: 'adminBrowsing',
      startTime: '1m',
    },
    payment_webhook: {
      executor: 'constant-vus',
      vus: 10,
      duration: '3m',
      exec: 'paymentWebhook',
      startTime: '2m',
    },
  },
  thresholds: {
    errors: ['rate<0.02'],
  },
};

export function rideBooking() {
  const payload = JSON.stringify({
    pickup_lat: -23.8889,
    pickup_lng: 29.4489,
    dropoff_lat: -23.9000,
    dropoff_lng: 29.4600,
    category: 'standard',
    payment_method: 'wallet',
  });

  const res = http.post(`${BASE_URL}/api/v1/rides`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, { 'ride created': (r) => r.status === 201 });
  errorRate.add(res.status !== 201);
  sleep(2);
}

export function driverLocationUpdate() {
  const payload = JSON.stringify({
    latitude: -23.94 + Math.random() * 0.02,
    longitude: 29.47 + Math.random() * 0.02,
    is_online: true,
  });

  const res = http.put(`${BASE_URL}/api/v1/drivers/location`, payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${__ENV.DRIVER_TOKEN || 'test-token'}`,
    },
  });

  check(res, { 'location updated': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  sleep(5);
}

export function adminBrowsing() {
  const endpoints = [
    '/api/v1/admin/dashboard',
    '/api/v1/admin/rides?per_page=20',
    '/api/v1/admin/reports/revenue',
  ];

  const url = `${BASE_URL}${endpoints[Math.floor(Math.random() * endpoints.length)]}`;
  const res = http.get(url, {
    headers: { Authorization: `Bearer ${__ENV.ADMIN_TOKEN || 'admin-token'}` },
  });

  check(res, { 'admin request ok': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  sleep(3);
}

export function paymentWebhook() {
  const payload = JSON.stringify({
    type: 'payment_intent.succeeded',
    data: { object: { id: `pi_${__VU}_${Date.now()}`, amount: 5000 } },
  });

  const res = http.post(`${BASE_URL}/api/v1/webhooks/stripe`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, { 'webhook processed': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  sleep(1);
}
