import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  scenarios: {
    stripe_webhooks: {
      executor: 'constant-vus',
      vus: 50,
      duration: '3m',
    },
  },
  thresholds: {
    errors: ['rate<0.001'],
    http_req_duration: ['p(95)<300'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export default function () {
  const payload = JSON.stringify({
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: `pi_test_${__VU}_${Date.now()}`,
        amount: Math.floor(Math.random() * 50000) + 1000,
        currency: 'zar',
        metadata: { ride_id: `ride_${__VU}` },
      },
    },
  });

  const res = http.post(`${BASE_URL}/api/v1/webhooks/stripe`, payload, {
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': `t=${Date.now()},v1=test_signature`,
    },
  });

  check(res, {
    'webhook accepted': (r) => r.status === 200,
  });

  errorRate.add(res.status !== 200);
  sleep(0.5);
}
