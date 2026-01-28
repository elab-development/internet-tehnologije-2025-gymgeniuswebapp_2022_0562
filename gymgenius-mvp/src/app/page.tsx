'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Ako je ulogovan, idi na Dashboard
        router.push('/dashboard');
      } else {
        // Ako nije ulogovan, idi na Login
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Loading state dok se proverava autentifikacija
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">💪 GymGenius</h2>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}