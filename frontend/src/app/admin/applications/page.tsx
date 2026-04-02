'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Filter, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'documents_pending', label: 'Documents Pending' },
  { value: 'eligible', label: 'Eligible' },
  { value: 'ineligible', label: 'Ineligible' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'waitlisted', label: 'Waitlisted' },
  { value: 'enrolled', label: 'Enrolled' },
];

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [updating, setUpdating] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  const fetchApps = useCallback(() => {
    setLoading(true);
    api.applications
      .getAll({ page, limit: 15, status, search })
      .then((r) => {
        const data = (r.data as any).data;
        setApplications(data.data || data || []);
        setTotal(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, status, search]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchApps();
  };

  const openDetail = (app: any) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setRemarks('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedApp || !newStatus) return;
    setUpdating(true);
    try {
      await api.applications.updateStatus(selectedApp._id, { status: newStatus, remarks });
      toast.success('Status updated successfully');
      setSelectedApp(null);
      fetchApps();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleEligibilityCheck = async () => {
    if (!selectedApp) return;
    setCheckingEligibility(true);
    try {
      const res = await api.applications.checkEligibility(selectedApp._id, {});
      const result = (res.data as any).data;
      toast.success(result.isEligible ? 'Student is ELIGIBLE!' : 'Student is NOT eligible.');
      fetchApps();
      setSelectedApp(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Eligibility check failed.');
    } finally {
      setCheckingEligibility(false);
    }
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="container-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-500 mt-1">Manage and review all student applications</p>
        </div>
        <span className="text-sm text-gray-500">{total} total</span>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder="Search by name, email, app number..."
          leftIcon={<Search className="w-4 h-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="input-base sm:w-48"
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <Button type="submit" variant="outline" leftIcon={<Filter className="w-4 h-4" />}>Filter</Button>
      </form>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="space-y-3 p-2">
            {[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : applications.length === 0 ? (
          <p className="text-center py-12 text-gray-500">No applications found.</p>
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
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-xs">{app.applicationNumber || '—'}</td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-800">{app.student?.name || '—'}</p>
                        <p className="text-xs text-gray-400">{app.student?.email}</p>
                      </div>
                    </td>
                    <td className="table-cell text-gray-600">{app.program?.name || '—'}</td>
                    <td className="table-cell text-gray-500">
                      {app.submittedAt ? formatDate(app.submittedAt) : '—'}
                    </td>
                    <td className="table-cell"><Badge status={app.status} /></td>
                    <td className="table-cell">
                      <Button variant="ghost" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />} onClick={() => openDetail(app)}>
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        )}
      </Card>

      {/* Review Modal */}
      <Modal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)} title="Review Application" size="lg">
        {selectedApp && (
          <div className="space-y-5">
            {/* Info rows */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500">Student</p><p className="font-medium">{selectedApp.student?.name}</p></div>
              <div><p className="text-gray-500">Email</p><p className="font-medium">{selectedApp.student?.email}</p></div>
              <div><p className="text-gray-500">Program</p><p className="font-medium">{selectedApp.program?.name}</p></div>
              <div><p className="text-gray-500">Submitted</p><p className="font-medium">{selectedApp.submittedAt ? formatDate(selectedApp.submittedAt) : 'Draft'}</p></div>
            </div>

            {/* Eligibility Check */}
            {selectedApp.eligibilityCheck?.checkedAt && (
              <div className={`rounded-xl p-4 ${selectedApp.eligibilityCheck.isEligible ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-2">
                  {selectedApp.eligibilityCheck.isEligible
                    ? <CheckCircle className="w-4 h-4 text-green-600" />
                    : <XCircle className="w-4 h-4 text-red-500" />}
                  <span className={`text-sm font-semibold ${selectedApp.eligibilityCheck.isEligible ? 'text-green-700' : 'text-red-600'}`}>
                    {selectedApp.eligibilityCheck.isEligible ? 'Eligible' : 'Not Eligible'}
                  </span>
                </div>
                {!selectedApp.eligibilityCheck.isEligible && selectedApp.eligibilityCheck.failedCriteria?.length > 0 && (
                  <ul className="mt-2 text-xs text-red-600 space-y-0.5 list-disc list-inside">
                    {selectedApp.eligibilityCheck.failedCriteria.map((c: string) => <li key={c}>{c}</li>)}
                  </ul>
                )}
              </div>
            )}

            <hr />

            {/* Update Status */}
            <Select
              label="Update Status"
              options={STATUS_OPTIONS.filter((o) => o.value)}
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            />
            <Textarea
              label="Remarks / Notes (optional)"
              placeholder="Add a note for student or internal record..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
            />

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                loading={checkingEligibility}
                onClick={handleEligibilityCheck}
                className="flex-1"
              >
                Run Eligibility Check
              </Button>
              <Button
                variant="primary"
                loading={updating}
                onClick={handleUpdateStatus}
                className="flex-1"
              >
                Update Status
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
