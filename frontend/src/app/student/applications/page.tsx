'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { AlertCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import type { Application } from '@/types';

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.applications
      .getMy()
      .then((res) => setApplications((res.data as any).data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-500 mt-1">All your submitted admission applications</p>
        </div>
        <Link href="/student/apply">
          <Button variant="primary" size="sm">+ New Application</Button>
        </Link>
      </div>

      <Card>
        {loading ? (
          <div className="space-y-3 p-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">You haven&apos;t applied to any programs yet.</p>
            <Link href="/student/apply" className="mt-4 inline-block">
              <Button variant="primary">Apply Now</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header">Application No.</th>
                  <th className="table-header">Program</th>
                  <th className="table-header">Submitted</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-mono text-xs text-gray-600">
                      {app.applicationNumber || '—'}
                    </td>
                    <td className="table-cell font-medium text-gray-800">
                      {typeof app.program === 'object' && 'name' in app.program
                        ? (app.program as any).name
                        : 'N/A'}
                    </td>
                    <td className="table-cell text-gray-500">
                      {app.submittedAt ? formatDate(app.submittedAt) : <span className="italic text-gray-400">Draft</span>}
                    </td>
                    <td className="table-cell">
                      <Badge status={app.status} />
                    </td>
                    <td className="table-cell">
                      <Link href={`/student/applications/${app._id}`}>
                        <Button variant="ghost" size="sm" className="text-primary-600 gap-1">
                          <FileText className="w-3.5 h-3.5" /> View
                        </Button>
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
