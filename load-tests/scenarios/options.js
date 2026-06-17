export const baseOptions = {
  thresholds: {
    http_req_duration: ['p(95)<500'],
    errors: ['rate<0.001'],
  },
};

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
export const SOCKET_URL = __ENV.SOCKET_URL || 'http://localhost:6001';
