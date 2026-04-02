'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, CreditCard } from 'lucide-react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.payments.getAll({ limit: 100 }).then((r) => setPayments((r.data as any).data || [])),
      api.payments.getRevenue().then((r) => setRevenue((r.data as any).data || [])),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = revenue.reduce((sum: number, r: any) => sum + (r.total || 0), 0);
  const completedPayments = payments.filter((p) => p.status === 'completed').length;

  return (
    <div className="container-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500 mt-1">Track fee collections and payment status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Revenue" value={loading ? '—' : formatCurrency(totalRevenue)} icon={<TrendingUp className="w-5 h-5" />} color="green" />
        <StatCard title="Total Payments" value={loading ? '—' : payments.length} icon={<CreditCard className="w-5 h-5" />} color="blue" />
        <StatCard title="Completed" value={loading ? '—' : completedPayments} icon={<CreditCard className="w-5 h-5" />} color="purple" />
        <StatCard title="Failed / Pending" value={loading ? '—' : payments.length - completedPayments} icon={<CreditCard className="w-5 h-5" />} color="orange" />
      </div>

      {/* Revenue by Type */}
      {!loading && revenue.length > 0 && (
        <Card title="Revenue by Payment Type" className="mb-6">
          <div className="grid sm:grid-cols-3 gap-4">
            {revenue.map((r: any) => (
              <div key={r._id} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 capitalize">{r._id?.replace(/_/g, ' ')}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(r.total)}</p>
                <p className="text-xs text-gray-400 mt-0.5">{r.count} payment{r.count !== 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Payments Table */}
      <Card title="All Payments">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : payments.length === 0 ? (
          <p className="text-center py-12 text-gray-500">No payment records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header">Receipt</th>
                  <th className="table-header">Student</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Method</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((pay) => (
                  <tr key={pay._id} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-xs text-gray-600">{pay.receiptNumber || '—'}</td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-800">{pay.student?.name || '—'}</p>
                        <p className="text-xs text-gray-400">{pay.student?.email}</p>
                      </div>
                    </td>
                    <td className="table-cell capitalize text-gray-600">{pay.type?.replace(/_/g, ' ')}</td>
                    <td className="table-cell font-semibold text-gray-900">{formatCurrency(pay.amount, pay.currency)}</td>
                    <td className="table-cell capitalize text-gray-600">{pay.paymentMethod?.replace(/_/g, ' ')}</td>
                    <td className="table-cell text-gray-500">{pay.paidAt ? formatDate(pay.paidAt) : formatDate(pay.createdAt)}</td>
                    <td className="table-cell"><Badge status={pay.status} /></td>
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
