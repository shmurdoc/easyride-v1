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
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        await api.setToken(token);
        const user = await auth.me();
        setState({ user, token, isLoading: false, isAuthenticated: true });
      } else {
        setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
      }
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    const { user, token } = await auth.login(email, password);
    await api.setToken(token);
    setState({ user, token, isLoading: false, isAuthenticated: true });
    return user;
  }, []);

  const register = useCallback(async (data: {
    name: string; email: string; password: string;
    password_confirmation: string; phone_number: string;
  }) => {
    const { user, token } = await auth.register(data);
    await api.setToken(token);
    setState({ user, token, isLoading: false, isAuthenticated: true });
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await auth.logout();
    } catch {} finally {
      await api.setToken(null);
      setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const user = await auth.me();
      setState((prev) => ({ ...prev, user }));
    } catch {}
  }, []);

  return { ...state, login, register, logout, refreshUser };
}
