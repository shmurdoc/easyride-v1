import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
const paymentTrend = new Trend('payment_create_duration');
const paymentRate = new Rate('payment_success_rate');

export const options = {
  stages: [
    { duration: '30s', target: 5 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 50 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    payment_create_duration: ['p(95)<5000'],
    payment_success_rate: ['rate>0.8'],
    http_req_duration: ['p(95)<3000'],
  },
};

function getRiderToken() {
  const res = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'rider@easyryde.com',
    password: 'password',
  }), { headers: { 'Content-Type': 'application/json' } });

  if (res.status !== 200) return null;
  return JSON.parse(res.body).token;
}

export default function () {
  group('Payment Processing', () => {
    const token = getRiderToken();
    if (!token) return;

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const paymentRes = http.post(`${BASE_URL}/api/v1/payments`, JSON.stringify({
      ride_id: `load-test-ride-${__VU}-${__ITER}`,
      amount: 45 + Math.floor(Math.random() * 100),
      currency: 'ZAR',
      payment_method: Math.random() > 0.5 ? 'wallet' : 'card',
    }), { headers });

    check(paymentRes, {
      'payment processed': (r) => r.status === 201 || r.status === 200,
    });

    paymentTrend.add(paymentRes.timings.duration);
    paymentRate.add(paymentRes.status === 201 || paymentRes.status === 200 ? 1 : 0);

    http.get(`${BASE_URL}/api/v1/payments`, {
      headers,
      tags: { name: 'PaymentsList' },
    });

    sleep(2);
  });
}
