import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, auth } from '../api';
import type { User } from '../types';

const TOKEN_KEY = 'auth_token';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    api.setOnUnauthorized(() => {
      api.clearToken();
      SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {
        if (__DEV__) console.warn('useAuth: Failed to clear token on unauthorized');
      });
      setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
    });
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        api.setToken(token);
        const user = await auth.me();
        setState({ user, token, isLoading: false, isAuthenticated: true });
      } else {
        setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
      }
    } catch (err: unknown) {
      const error = err as Error & { code?: string };
      if (error.message?.includes('Network') || error.name === 'AbortError' || error.code === 'ERR_NETWORK') {
        if (__DEV__) console.warn('Auth: Network error on startup, will retry later');
        setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
      } else {
        api.clearToken();
        await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {
          if (__DEV__) console.warn('useAuth: Failed to clear token on auth error');
        });
        setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
      }
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    const { user, token } = await auth.login(email, password);
    api.setToken(token);
    setState({ user, token, isLoading: false, isAuthenticated: true });
    return user;
  }, []);

  const register = useCallback(async (data: {
    name: string; email: string; password: string;
    password_confirmation: string; phone_number: string;
  }) => {
    const { user, token } = await auth.register(data);
    api.setToken(token);
    setState({ user, token, isLoading: false, isAuthenticated: true });
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await auth.logout();
    } catch {
      if (__DEV__) console.warn('Auth: Logout API call failed');
    }
    api.clearToken();
    SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {
      if (__DEV__) console.warn('useAuth: Failed to clear token on logout');
    });
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const user = await auth.me();
      setState((prev) => ({ ...prev, user }));
    } catch {
      if (__DEV__) console.warn('Auth: Failed to refresh user');
    }
  }, []);

  return { ...state, login, register, logout, refreshUser };
}
