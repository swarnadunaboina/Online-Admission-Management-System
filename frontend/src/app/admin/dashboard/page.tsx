'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, FileText, CreditCard, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  draft: '#9ca3af',
  submitted: '#3b82f6',
  under_review: '#8b5cf6',
  documents_pending: '#f59e0b',
  eligible: '#10b981',
  ineligible: '#ef4444',
  shortlisted: '#6366f1',
  accepted: '#22c55e',
  rejected: '#f43f5e',
  waitlisted: '#f97316',
  enrolled: '#14b8a6',
  withdrawn: '#6b7280',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [inquiryStats, setInquiryStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.applications.getStats().then((r) => setStats((r.data as any).data)),
      api.applications.getAll({ limit: 8 }).then((r) =>
        setRecentApps((r.data as any).data || [])
      ),
      api.inquiries.getStats().then((r) => setInquiryStats((r.data as any).data)),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const chartData = stats?.byStatus
    ? Object.entries(stats.byStatus).map(([status, count]) => ({ status, count }))
    : [];

  return (
    <div className="container-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of admissions this session</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Applications"
          value={loading ? '—' : stats?.total ?? 0}
          icon={<FileText className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Accepted"
          value={loading ? '—' : (stats?.byStatus?.accepted ?? 0) + (stats?.byStatus?.enrolled ?? 0)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Pending Review"
          value={loading ? '—' : (stats?.byStatus?.submitted ?? 0) + (stats?.byStatus?.under_review ?? 0)}
          icon={<Clock className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Open Inquiries"
          value={loading ? '—' : (inquiryStats?.new ?? 0) + (inquiryStats?.in_progress ?? 0)}
          icon={<MessageSquare className="w-5 h-5" />}
          color="orange"
        />
      </div>

      <div className="grid lg:grid-cols-5 gap-6 mb-6">
        {/* Applications by Status Chart */}
        <Card title="Applications by Status" className="lg:col-span-3">
          {loading ? (
            <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 40, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="status" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  formatter={(v) => [v, 'Applications']}
                  labelStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Inquiry Stats */}
        <Card title="Inquiry Overview" className="lg:col-span-2">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'New', value: inquiryStats?.new ?? 0, color: 'text-blue-600 bg-blue-50' },
                { label: 'In Progress', value: inquiryStats?.in_progress ?? 0, color: 'text-purple-600 bg-purple-50' },
                { label: 'Resolved', value: inquiryStats?.resolved ?? 0, color: 'text-green-600 bg-green-50' },
                { label: 'Closed', value: inquiryStats?.closed ?? 0, color: 'text-gray-600 bg-gray-100' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <span className="text-sm text-gray-700">{label}</span>
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${color}`}>{value}</span>
                </div>
              ))}
              <Link href="/admin/inquiries" className="block pt-1">
                <Button variant="outline" size="sm" className="w-full">View All Inquiries</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Applications */}
      <Card
        title="Recent Applications"
        footer={
          <Link href="/admin/applications">
            <Button variant="ghost" size="sm" className="text-primary-600">View All Applications →</Button>
          </Link>
        }
      >
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : recentApps.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No applications yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header">App. No.</th>
                  <th className="table-header">Student</th>
                  <th className="table-header">Program</th>
                  <th className="table-header">Submitted</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentApps.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-xs text-gray-600">{app.applicationNumber || '—'}</td>
                    <td className="table-cell text-gray-800 font-medium">{app.student?.name || '—'}</td>
                    <td className="table-cell text-gray-600">{app.program?.name || '—'}</td>
                    <td className="table-cell text-gray-500">
                      {app.submittedAt ? formatDate(app.submittedAt) : <span className="italic text-gray-400">Draft</span>}
                    </td>
                    <td className="table-cell"><Badge status={app.status} /></td>
                    <td className="table-cell">
                      <Link href={`/admin/applications/${app._id}`}>
                        <Button variant="ghost" size="sm" className="text-primary-600">Review</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
