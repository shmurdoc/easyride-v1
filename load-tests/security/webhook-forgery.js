import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export const options = {
  vus: 1,
  iterations: 6,
  thresholds: {
    errors: ['rate<0'],
  },
};

export default function () {
  switch (__ITER) {
    case 0: {
      const noSignature = http.post(
        `${BASE_URL}/api/v1/webhooks/stripe`,
        JSON.stringify({ type: 'payment_intent.succeeded' }),
        { headers: { 'Content-Type': 'application/json' } },
      );
      check(noSignature, { 'missing signature → rejected': (r) => r.status !== 200 });
      errorRate.add(noSignature.status === 200);
      break;
    }

    case 1: {
      const wrongSignature = http.post(
        `${BASE_URL}/api/v1/webhooks/stripe`,
        JSON.stringify({ type: 'payment_intent.succeeded' }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Stripe-Signature': 't=123456789,v1=invalid_signature',
          },
        },
      );
      check(wrongSignature, { 'invalid signature → rejected': (r) => r.status !== 200 });
      errorRate.add(wrongSignature.status === 200);
      break;
    }

    case 2: {
      const replayAttack = http.post(
        `${BASE_URL}/api/v1/webhooks/stripe`,
        JSON.stringify({ type: 'payment_intent.succeeded' }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Stripe-Signature': `t=${Math.floor(Date.now() / 1000) - 300},v1=old_signature`,
          },
        },
      );
      check(replayAttack, { 'old timestamp → rejected': (r) => r.status !== 200 });
      errorRate.add(replayAttack.status === 200);
      break;
    }

    case 3: {
      const payfastForgery = http.post(
        `${BASE_URL}/api/v1/webhooks/payfast`,
        JSON.stringify({
          pt_status: 'COMPLETE',
          amount_gross: 999999.99,
          m_payment_id: 'forged',
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );
      check(payfastForgery, { 'forged payfast → rejected': (r) => r.status !== 200 });
      errorRate.add(payfastForgery.status === 200);
      break;
    }

    case 4: {
      const ozowForgery = http.post(
        `${BASE_URL}/api/v1/webhooks/ozow`,
        JSON.stringify({
          TransactionId: 'forged',
          Status: 'Complete',
          Amount: 999999.99,
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );
      check(ozowForgery, { 'forged ozow → rejected': (r) => r.status !== 200 });
      errorRate.add(ozowForgery.status === 200);
      break;
    }

    case 5: {
      const twilioForgery = http.post(
        `${BASE_URL}/api/v1/webhooks/twilio`,
        JSON.stringify({
          MessageSid: 'SMforged',
          MessageStatus: 'delivered',
          To: '+27720000000',
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );
      check(twilioForgery, { 'forged twilio → rejected': (r) => r.status !== 200 });
      errorRate.add(twilioForgery.status === 200);
      break;
    }
  }

  sleep(0.5);
}
