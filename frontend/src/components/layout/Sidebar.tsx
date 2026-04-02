'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Upload,
  CreditCard,
  MessageSquare,
  BookOpen,
  Users,
  Settings,
  BarChart3,
  Plus,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

const studentSections: SidebarSection[] = [
  {
    items: [
      { label: 'Dashboard', href: '/student/dashboard', icon: <LayoutDashboard size={18} /> },
    ],
  },
  {
    title: 'Application',
    items: [
      { label: 'Apply Now', href: '/student/apply', icon: <Plus size={18} /> },
      { label: 'My Applications', href: '/student/applications', icon: <FileText size={18} /> },
    ],
  },
  {
    title: 'Documents & Payments',
    items: [
      { label: 'My Documents', href: '/student/documents', icon: <Upload size={18} /> },
      { label: 'Fee Payment', href: '/student/payment', icon: <CreditCard size={18} /> },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'My Inquiries', href: '/student/inquiries', icon: <MessageSquare size={18} /> },
      { label: 'Programs', href: '/student/programs', icon: <BookOpen size={18} /> },
    ],
  },
];

const adminSections: SidebarSection[] = [
  {
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    ],
  },
  {
    title: 'Admissions',
    items: [
      { label: 'Applications', href: '/admin/applications', icon: <FileText size={18} /> },
      { label: 'Documents', href: '/admin/documents', icon: <Upload size={18} /> },
      { label: 'Payments', href: '/admin/payments', icon: <CreditCard size={18} /> },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Programs', href: '/admin/programs', icon: <GraduationCap size={18} /> },
      { label: 'Students', href: '/admin/students', icon: <Users size={18} /> },
      { label: 'Inquiries', href: '/admin/inquiries', icon: <MessageSquare size={18} /> },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { label: 'Reports', href: '/admin/reports', icon: <BarChart3 size={18} /> },
      { label: 'Settings', href: '/admin/settings', icon: <Settings size={18} /> },
    ],
  },
];

interface SidebarProps {
  role?: 'student' | 'admin' | 'staff';
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ role = 'student', isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const sections = role === 'student' ? studentSections : adminSections;

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200',
          'flex flex-col z-30 transition-transform duration-300 overflow-y-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
        )}
      >
        <nav className="flex-1 py-4 px-3">
          {sections.map((section, idx) => (
            <div key={idx} className="mb-6">
              {section.title && (
                <p className="px-3 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {section.title}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/student/dashboard' &&
                      item.href !== '/admin/dashboard' &&
                      pathname.startsWith(item.href));

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                          'transition-all duration-200',
                          isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                        )}
                      >
                        <span className={cn(isActive ? 'text-primary-600' : 'text-gray-400')}>
                          {item.icon}
                        </span>
                        {item.label}
                        {item.badge && (
                          <span className="ml-auto bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
