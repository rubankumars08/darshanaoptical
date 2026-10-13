'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AdminUser, Role } from './types';

// ─── Auth Context ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  role: Role | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount by calling /api/admin/auth/me
  useEffect(() => {
    fetch('/api/admin/auth/me')
      .then(async (res) => {
        if (!res.ok) {
          // The cookie signature is still valid but the server rejected the
          // session — the account was deactivated, its role changed, or the
          // user was deleted. Drop the cookie, otherwise proxy.ts keeps seeing
          // a "valid" session and bounces /admin/login back to the dashboard
          // while this provider bounces it the other way.
          await fetch('/api/admin/auth/logout', { method: 'POST' }).catch(() => {});
          return;
        }
        const { user: u } = await res.json();
        // /auth/me now returns the real profile fields; these used to be
        // hard-coded placeholders on the client.
        setUser({
          id: u.id ?? u.userId,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status ?? 'active',
          joinedAt: u.joinedAt ?? '',
          lastActive: u.lastActive ?? undefined,
          phone: u.phone ?? '',
        });
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch('/api/admin/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const json = await res.json();
        if (!res.ok) return { success: false, error: json.error ?? 'Login failed.' };

        const u = json.user;
        setUser({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: 'active',
          joinedAt: '',
          phone: '',
        });
        return { success: true };
      } catch {
        return { success: false, error: 'Network error. Please try again.' };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, role: user?.role ?? null }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
