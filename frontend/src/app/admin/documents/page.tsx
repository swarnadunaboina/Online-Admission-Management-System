'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, FileText, Eye } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { formatDate, formatFileSize } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Document as AppDocument } from '@/types';

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AppDocument | null>(null);
  const [action, setAction] = useState<'verify' | 'reject' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchDocs = () => {
    setLoading(true);
    api.documents
      .getAll({ status: statusFilter, limit: 50 })
      .then((r) => setDocuments((r.data as any).data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDocs(); }, [statusFilter]);

  const handleVerify = async (resolvedAction: 'verify' | 'reject') => {
    if (!selected) return;
    setAction(resolvedAction);
    setProcessing(true);
    try {
      await api.documents.verify(selected._id, {
        status: resolvedAction === 'verify' ? 'verified' : 'rejected',
        remarks,
      });
      toast.success(`Document ${resolvedAction === 'verify' ? 'verified' : 'rejected'} successfully.`);
      setSelected(null);
      setAction(null);
      fetchDocs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Verification</h1>
          <p className="text-gray-500 mt-1">Review and verify student-uploaded documents</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-base w-44"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <Card>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No documents found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header">Document</th>
                  <th className="table-header">Student</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Size</th>
                  <th className="table-header">Uploaded</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium text-gray-800">{doc.name}</td>
                    <td className="table-cell text-gray-600">{(doc.student as any)?.name || '—'}</td>
                    <td className="table-cell">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">
                        {doc.type?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="table-cell text-gray-500">{formatFileSize(doc.fileSize)}</td>
                    <td className="table-cell text-gray-500">{formatDate(doc.createdAt!)}</td>
                    <td className="table-cell"><Badge status={doc.status} /></td>
                    <td className="table-cell">
                      {doc.status !== 'verified' && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                            onClick={() => { setSelected(doc); setAction(null); setRemarks(''); }}
                          >
                            Review
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Review Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Review Document">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-gray-500">Document</p><p className="font-medium">{selected.name}</p></div>
              <div><p className="text-gray-500">Type</p><p className="font-medium capitalize">{selected.type?.replace(/_/g, ' ')}</p></div>
              <div><p className="text-gray-500">File Size</p><p className="font-medium">{formatFileSize(selected.fileSize)}</p></div>
              <div><p className="text-gray-500">Current Status</p><Badge status={selected.status} /></div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
              <p className="font-medium mb-1">File: {selected.fileName}</p>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}/${selected.filePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 underline text-xs"
              >
                Open document in new tab ↗
              </a>
            </div>

            <Textarea
              label="Remarks (optional for verify, required for rejection)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              placeholder="Add notes for the student..."
            />

            <div className="flex gap-3">
              <Button
                variant="danger"
                loading={processing && action === 'reject'}
                leftIcon={<XCircle className="w-4 h-4" />}
                className="flex-1"
                onClick={() => handleVerify('reject')}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                loading={processing && action === 'verify'}
                leftIcon={<CheckCircle className="w-4 h-4" />}
                className="flex-1"
                onClick={() => handleVerify('verify')}
              >
                Verify
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
