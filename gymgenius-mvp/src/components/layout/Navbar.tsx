'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Dumbbell, Trophy, User, LogOut, Cpu, TrendingUp } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/exercises', label: 'Exercises', icon: Dumbbell },
    { href: '/ai-workout', label: 'AI Workout', icon: Cpu },
    { href: '/progress', label: 'Progress', icon: TrendingUp },
    { href: '/challenges', label: 'Challenges', icon: Trophy },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl">💪</span>
            <span className="text-xl font-bold text-gray-900">GymGenius</span>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive(link.href)
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* User Menu */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <NotificationBell />

              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                leftIcon={<LogOut size={18} />}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {isAuthenticated && (
        <div className="md:hidden border-t border-gray-200">
          <div className="flex justify-around py-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${
                    isActive(link.href)
                      ? 'text-primary-700'
                      : 'text-gray-600'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}