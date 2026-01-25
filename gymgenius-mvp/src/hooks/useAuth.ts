'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/models';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Custom hook za upravljanje autentifikacijom
 * 
 * @example
 * const { user, login, logout, isLoading } = useAuth();
 */
export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Učitaj korisnika iz localStorage pri mount-u
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuthState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error('Failed to parse user data:', error);
        logout();
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  /**
   * Login funkcija
   */
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Login failed');
      }

      // Sačuvaj u localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Ažuriraj state
      setAuthState({
        user: data.data.user,
        token: data.data.token,
        isLoading: false,
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  /**
   * Register funkcija
   */
  const register = async (email: string, password: string, displayName?: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      // Sačuvaj u localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Ažuriraj state
      setAuthState({
        user: data.data.user,
        token: data.data.token,
        isLoading: false,
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  /**
   * Logout funkcija
   */
  const logout = async () => {
    try {
      const token = localStorage.getItem('token');

      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Uvek očisti localStorage i state
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });

      router.push('/login');
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
  };
}