'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { MessageSquare, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import type { Inquiry } from '@/types';

const inquirySchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  category: z.string().min(1, 'Please select a category'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

type InquiryForm = z.infer<typeof inquirySchema>;

const CATEGORIES = [
  { value: '', label: 'Select category...' },
  { value: 'admission_process', label: 'Admission Process' },
  { value: 'eligibility', label: 'Eligibility' },
  { value: 'documents', label: 'Documents' },
  { value: 'fees', label: 'Fees & Payment' },
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'program_details', label: 'Program Details' },
  { value: 'technical_issue', label: 'Technical Issue' },
  { value: 'other', label: 'Other' },
];

export default function StudentInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryForm>({ resolver: zodResolver(inquirySchema) });

  const fetchInquiries = () => {
    api.inquiries
      .getMy()
      .then((res) => setInquiries((res.data as any).data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInquiries(); }, []);

  const onSubmit = async (data: InquiryForm) => {
    try {
      await api.inquiries.create(data);
      toast.success('Inquiry submitted! Our team will respond shortly.');
      reset();
      setShowForm(false);
      fetchInquiries();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit inquiry.');
    }
  };

  return (
    <div className="container-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Inquiries</h1>
          <p className="text-gray-500 mt-1">Submit questions and get responses from our admissions team</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>
          New Inquiry
        </Button>
      </div>

      {/* New Inquiry Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Submit a New Inquiry"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Category"
            required
            options={CATEGORIES}
            error={errors.category?.message}
            {...register('category')}
          />
          <Input
            label="Subject"
            placeholder="Brief subject of your inquiry"
            required
            error={errors.subject?.message}
            {...register('subject')}
          />
          <Textarea
            label="Message"
            placeholder="Describe your query in detail..."
            rows={5}
            required
            error={errors.message?.message}
            {...register('message')}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              Submit Inquiry
            </Button>
          </div>
        </form>
      </Modal>

      {/* Inquiries List */}
      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)
        ) : inquiries.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No inquiries submitted yet.</p>
              <Button variant="primary" size="sm" className="mt-4" onClick={() => setShowForm(true)}>
                Ask a Question
              </Button>
            </div>
          </Card>
        ) : (
          inquiries.map((inquiry) => (
            <Card key={inquiry._id}>
              <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() => setExpandedId(expandedId === inquiry._id ? null : inquiry._id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-900">{inquiry.subject}</h3>
                    <Badge status={inquiry.status} />
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                      {inquiry.category?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(inquiry.createdAt!)}</p>
                </div>
                {expandedId === inquiry._id
                  ? <ChevronUp className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" />}
              </div>

              {expandedId === inquiry._id && (
                <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                  {/* Original message */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1 font-medium">Your message</p>
                    <p className="text-sm text-gray-700">{inquiry.message}</p>
                  </div>

                  {/* Responses */}
                  {inquiry.responses && inquiry.responses.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-2">Responses</p>
                      <div className="space-y-3">
                        {inquiry.responses.map((resp: any, i: number) => (
                          <div key={i} className="bg-primary-50 rounded-xl p-4 border-l-4 border-primary-400">
                            <p className="text-sm text-primary-800">{resp.message}</p>
                            <p className="text-xs text-primary-500 mt-1">
                              {resp.respondedBy?.name || 'Admissions Team'} · {formatDateTime(resp.respondedAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {inquiry.status === 'new' && (
                    <p className="text-xs text-amber-600 italic">
                      Your inquiry is awaiting a response from our team.
                    </p>
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
