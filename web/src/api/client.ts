import axios from 'axios';

const API_BASE = '/api/v1';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const AUTH_UNAUTHORIZED_EVENT = 'easyryde:auth:unauthorized';

function emitUnauthorized() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
}

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      emitUnauthorized();
    }
    return Promise.reject(error);
  },
);

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export default client;
