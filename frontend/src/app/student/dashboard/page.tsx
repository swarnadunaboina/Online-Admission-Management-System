'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  MessageSquare,
  ArrowRight,
  PlusCircle,
  AlertCircle,
} from 'lucide-react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Application } from '@/types';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.applications
      .getMy()
      .then((res) => setApplications((res.data as any).data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: applications.length,
    submitted: applications.filter((a) =>
      ['submitted', 'under_review', 'documents_pending', 'shortlisted', 'eligible'].includes(a.status)
    ).length,
    accepted: applications.filter((a) => ['accepted', 'enrolled'].includes(a.status)).length,
    rejected: applications.filter((a) => ['rejected', 'ineligible'].includes(a.status)).length,
  };

  const quickActions = [
    { label: 'Apply to a Program', href: '/student/apply', icon: PlusCircle, color: 'text-primary-600 bg-primary-50' },
    { label: 'Upload Documents', href: '/student/documents', icon: FileText, color: 'text-orange-600 bg-orange-50' },
    { label: 'Make a Payment', href: '/student/payment', icon: CreditCard, color: 'text-teal-600 bg-teal-50' },
    { label: 'Submit Inquiry', href: '/student/inquiries', icon: MessageSquare, color: 'text-rose-600 bg-rose-50' },
  ];

  return (
    <div className="container-page">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0] || 'Student'} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your applications.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Applications"
          value={stats.total}
          icon={<FileText className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="In Review"
          value={stats.submitted}
          icon={<Clock className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Accepted"
          value={stats.accepted}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Not Accepted"
          value={stats.rejected}
          icon={<XCircle className="w-5 h-5" />}
          color="red"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2">
          <Card
            title="Recent Applications"
            description="Your latest admission applications"
            footer={
              <Link href="/student/applications">
                <Button variant="ghost" size="sm" className="gap-1 text-primary-600">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            }
          >
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-10">
                <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No applications yet.</p>
                <Link href="/student/apply" className="mt-3 inline-block">
                  <Button variant="primary" size="sm">Apply Now</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {applications.slice(0, 5).map((app) => (
                  <div key={app._id} className="py-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {typeof app.program === 'object' && 'name' in app.program
                          ? (app.program as any).name
                          : 'Program'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {app.applicationNumber} · {formatDate(app.createdAt!)}
                      </p>
                    </div>
                    <Badge status={app.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card title="Quick Actions">
            <div className="space-y-2">
              {quickActions.map(({ label, href, icon: Icon, color }) => (
                <Link key={href} href={href}>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600">
                      {label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 ml-auto group-hover:text-primary-500" />
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Profile Completion */}
          <Card title="Profile Completion">
            <div className="space-y-3">
              {[
                { label: 'Personal Info', done: !!user?.phone },
                { label: 'Date of Birth', done: !!user?.dateOfBirth },
                { label: 'First Application', done: applications.length > 0 },
                { label: 'Document Upload', done: false },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className={done ? 'text-gray-700' : 'text-gray-400'}>{label}</span>
                  {done ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
