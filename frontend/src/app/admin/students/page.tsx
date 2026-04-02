'use client';

import { useEffect, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchStudents = () => {
    setLoading(true);
    api.users
      .getAll({ page, limit: 20, role: 'student', search })
      .then((r) => {
        const data = (r.data as any).data;
        setStudents(data.data || data || []);
        setTotal(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="container-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 mt-1">All registered students on the portal</p>
        </div>
        <span className="text-sm text-gray-500">{total} registered</span>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <Input
          placeholder="Search by name or email..."
          leftIcon={<Search className="w-4 h-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <button type="submit" className="btn-primary px-4 text-sm rounded-xl">Search</button>
      </form>

      <Card>
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No students found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header">Name</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Phone</th>
                  <th className="table-header">Registered</th>
                  <th className="table-header">Last Login</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {s.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{s.name}</span>
                      </div>
                    </td>
                    <td className="table-cell text-gray-600">{s.email}</td>
                    <td className="table-cell text-gray-500">{s.phone || '—'}</td>
                    <td className="table-cell text-gray-500">{formatDate(s.createdAt)}</td>
                    <td className="table-cell text-gray-500">{s.lastLoginAt ? formatDate(s.lastLoginAt) : '—'}</td>
                    <td className="table-cell"><Badge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
              className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-40"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
