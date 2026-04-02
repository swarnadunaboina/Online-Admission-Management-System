'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Menu, Bell, LogOut, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    toast.success('Logged out successfully');
    router.replace('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 h-16">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors lg:hidden"
            >
              <Menu size={20} />
            </button>
          )}
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1.5 bg-primary-600 rounded-lg">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:block">
              Admission<span className="text-primary-600">Pro</span>
            </span>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-primary-700" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">{user.role}</p>
                  </div>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                    <Link
                      href={user.role === 'student' ? '/student/dashboard' : '/admin/dashboard'}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User size={14} />
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User size={14} />
                      Profile
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2.5 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Apply Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
