import * as SecureStore from 'expo-secure-store';
import { API_TIMEOUT } from '../constants';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8082/api';
const API_VERSION = 'v1';
const TOKEN_KEY = 'auth_token';
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

class ApiClient {
  private baseUrl: string;
  private _token: string | null = null;
  private _tokenPromise: Promise<string | null> | null = null;
  private onUnauthorized?: () => void;

  constructor() {
    this.baseUrl = `${API_BASE}/${API_VERSION}`;
  }

  setToken(token: string | null) {
    this._token = token;
    this._tokenPromise = null;
    if (token) {
      SecureStore.setItemAsync(TOKEN_KEY, token).catch(() => {
        if (__DEV__) console.warn('ApiClient: Failed to persist token to SecureStore');
      });
    } else {
      SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {
        if (__DEV__) console.warn('ApiClient: Failed to remove token from SecureStore');
      });
    }
  }

  clearToken() {
    this._token = null;
    this._tokenPromise = null;
    SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {
      if (__DEV__) console.warn('ApiClient: Failed to remove token from SecureStore');
    });
  }

  setOnUnauthorized(callback: () => void) {
    this.onUnauthorized = callback;
  }

  private async loadToken(): Promise<string | null> {
    if (this._token) return this._token;
    if (this._tokenPromise) return this._tokenPromise;
    this._tokenPromise = (async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        this._token = token;
        return token;
      } catch {
        return null;
      }
    })();
    return this._tokenPromise;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: { params?: Record<string, string> },
    retries = 0,
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const token = await this.loadToken();

      let url = `${this.baseUrl}${path}`;
      if (options?.params) {
        const query = new URLSearchParams(options.params).toString();
        url += `?${query}`;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        this.onUnauthorized?.();
        throw new ApiError('Unauthorized', 401);
      }

      if (response.status === 204) {
        return undefined as unknown as T;
      }

      const data: Record<string, unknown> = await response.json();

      const hasEnvelope = 'success' in data && 'data' in data;

      if (hasEnvelope) {
        if (data.success === false) {
          throw new ApiError(
            (data.message as string) || 'Request failed',
            response.status,
            data,
          );
        }
        return (data.data as unknown) as T;
      }

      if (!response.ok) {
        throw new ApiError((data.message as string) || 'Request failed', response.status, data);
      }

      return data as T;
    } catch (err) {
      clearTimeout(timeoutId);
      if (retries < MAX_RETRIES && (err instanceof TypeError || (err as Error).name === 'AbortError')) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        return this.request<T>(method, path, body, options, retries + 1);
      }
      throw err;
    }
  }

  get<T>(path: string, params?: Record<string, string>) {
    return this.request<T>('GET', path, undefined, { params });
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>('POST', path, body);
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>('PUT', path, body);
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>('PATCH', path, body);
  }

  delete<T>(path: string) {
    return this.request<T>('DELETE', path);
  }
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const api = new ApiClient();
