'use client';

import { useRouter } from 'next/navigation';
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { setAuthFailureHandler } from '@/lib/http';
import { type StaffUser, authService } from '@/services/auth.service';

export interface AuthState {
  user: StaffUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ mustChangePassword: boolean }>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<StaffUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // The HTTP layer calls this when a silent refresh fails: drop the user and
  // send them to /login. Registered once so `http` stays free of React deps.
  useEffect(() => {
    setAuthFailureHandler(() => {
      setUser(null);
      router.replace('/login');
    });
    return () => setAuthFailureHandler(null);
  }, [router]);

  // Bootstrap auth state from the server on mount. Tokens live in HttpOnly
  // cookies — JS cannot read them. /auth/me returns the profile if the
  // access_token cookie is valid; if it expired, the response interceptor
  // silently refreshes and replays before we ever see a failure.
  useEffect(() => {
    authService
      .me()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login({ email, password });
      setUser(res.data.staff);
      return { mustChangePassword: res.data.mustChangePassword };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
      router.replace('/login');
    }
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, isLoading, login, logout }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
