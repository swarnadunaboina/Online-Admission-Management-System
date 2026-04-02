'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea, Select } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Inquiry } from '@/types';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('new');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchInquiries = () => {
    setLoading(true);
    api.inquiries
      .getAll({ status: statusFilter, limit: 50 })
      .then((r) => setInquiries((r.data as any).data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInquiries(); }, [statusFilter]);

  const handleRespond = async (id: string) => {
    const message = responseText[id]?.trim();
    if (!message) { toast.error('Response cannot be empty.'); return; }
    setSending(id);
    try {
      await api.inquiries.respond(id, { message });
      toast.success('Response sent!');
      setResponseText((prev) => ({ ...prev, [id]: '' }));
      fetchInquiries();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send response.');
    } finally {
      setSending(null);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingStatus(id);
    try {
      await api.inquiries.updateStatus(id, { status });
      toast.success('Status updated.');
      fetchInquiries();
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div className="container-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
          <p className="text-gray-500 mt-1">Respond to student questions and inquiries</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-base w-44"
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)
        ) : inquiries.length === 0 ? (
          <Card>
            <div className="text-center py-16 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No inquiries found for this status.</p>
            </div>
          </Card>
        ) : (
          inquiries.map((inquiry) => (
            <Card key={inquiry._id}>
              {/* Header row */}
              <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() => setExpandedId(expandedId === inquiry._id ? null : inquiry._id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-900">{inquiry.subject}</h3>
                    <Badge status={inquiry.status} />
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">
                      {inquiry.category?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-gray-500">From: <strong>{inquiry.name || 'Student'}</strong> ({inquiry.email})</p>
                    <p className="text-xs text-gray-400">{formatDateTime(inquiry.createdAt!)}</p>
                  </div>
                </div>
                {expandedId === inquiry._id
                  ? <ChevronUp className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" />}
              </div>

              {/* Expanded content */}
              {expandedId === inquiry._id && (
                <div className="mt-4 border-t border-gray-100 pt-4 space-y-4">
                  {/* Original message */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 font-medium mb-1">Student&apos;s message</p>
                    <p className="text-sm text-gray-700">{inquiry.message}</p>
                  </div>

                  {/* Previous responses */}
                  {inquiry.responses && inquiry.responses.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 font-medium">Previous Responses</p>
                      {inquiry.responses.map((r: any, i: number) => (
                        <div key={i} className="bg-primary-50 rounded-xl p-3 border-l-4 border-primary-400">
                          <p className="text-sm text-primary-800">{r.message}</p>
                          <p className="text-xs text-primary-500 mt-1">
                            {r.respondedBy?.name || 'Staff'} · {formatDateTime(r.respondedAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply & status change */}
                  {inquiry.status !== 'closed' && (
                    <div className="space-y-3">
                      <Textarea
                        label="Write a Response"
                        placeholder="Type your response here..."
                        rows={3}
                        value={responseText[inquiry._id] || ''}
                        onChange={(e) => setResponseText((prev) => ({ ...prev, [inquiry._id]: e.target.value }))}
                      />
                      <div className="flex items-center gap-3 flex-wrap">
                        <Button
                          variant="primary"
                          size="sm"
                          loading={sending === inquiry._id}
                          leftIcon={<Send className="w-3.5 h-3.5" />}
                          onClick={() => handleRespond(inquiry._id)}
                        >
                          Send Response
                        </Button>
                        <Select
                          options={[
                            { value: inquiry.status, label: `Current: ${inquiry.status}` },
                            { value: 'in_progress', label: 'Mark In Progress' },
                            { value: 'resolved', label: 'Mark Resolved' },
                            { value: 'closed', label: 'Close Inquiry' },
                          ]}
                          value={inquiry.status}
                          onChange={(e) => handleStatusChange(inquiry._id, e.target.value)}
                          disabled={updatingStatus === inquiry._id}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
