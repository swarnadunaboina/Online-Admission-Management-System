'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Program } from '@/types';

const EMPTY_FORM = {
  name: '', code: '', description: '', department: '',
  level: 'undergraduate', duration: '', totalSeats: '',
  applicationFee: '', tuitionFee: '', registrationFee: '',
  minPercentage: '', requiredDocuments: '',
};

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Program | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchPrograms = () => {
    api.programs.getAll({ limit: 100 }).then((r) => setPrograms((r.data as any).data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPrograms(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (p: Program) => {
    setEditing(p);
    setForm({
      name: p.name ?? '', code: p.code ?? '', description: p.description ?? '', department: p.department ?? '',
      level: p.level ?? 'undergraduate', duration: p.duration ?? '', totalSeats: String(p.totalSeats ?? ''),
      applicationFee: String(p.fees?.applicationFee || ''),
      tuitionFee: String(p.fees?.tuitionFee || ''),
      registrationFee: String(p.fees?.registrationFee || ''),
      minPercentage: String(p.eligibilityCriteria?.minPercentage || ''),
      requiredDocuments: (p.requiredDocuments || []).join(', '),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.code || !form.department || !form.duration || !form.totalSeats) {
      toast.error('Please fill all required fields.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name, code: form.code, description: form.description,
        department: form.department, level: form.level, duration: form.duration,
        totalSeats: parseInt(form.totalSeats),
        fees: {
          applicationFee: parseFloat(form.applicationFee) || 0,
          tuitionFee: parseFloat(form.tuitionFee) || 0,
          registrationFee: parseFloat(form.registrationFee) || 0,
          currency: 'INR',
        },
        eligibilityCriteria: { minPercentage: parseFloat(form.minPercentage) || 0 },
        requiredDocuments: form.requiredDocuments ? form.requiredDocuments.split(',').map((s) => s.trim()) : [],
      };

      if (editing) {
        await api.programs.update(editing._id, payload);
        toast.success('Program updated.');
      } else {
        await api.programs.create(payload);
        toast.success('Program created.');
      }
      setShowForm(false);
      fetchPrograms();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.programs.delete(deleteTarget._id);
      toast.success('Program deleted.');
      setDeleteTarget(null);
      fetchPrograms();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  const f = (key: keyof typeof EMPTY_FORM) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  });

  return (
    <div className="container-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
          <p className="text-gray-500 mt-1">Manage admission programs and offerings</p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreate}>
          Add Program
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No programs created yet.</p>
            <Button variant="primary" size="sm" className="mt-4" onClick={openCreate}>Create First Program</Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {programs.map((p) => (
              <div key={p._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{p.name}</h3>
                    <p className="text-xs text-gray-500">{p.code} · {p.department} · <span className="capitalize">{p.level}</span></p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteTarget(p)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{p.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{p.duration} · {p.totalSeats - (p.enrolledSeats || 0)} seats left</span>
                  <span className="font-semibold text-gray-700">{formatCurrency(p.fees?.applicationFee || 0)} app. fee</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Program' : 'Create Program'} size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Program Name" required {...f('name')} />
            <Input label="Program Code" required placeholder="e.g., BTECH-CS" {...f('code')} />
          </div>
          <Textarea label="Description" rows={2} {...f('description')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Department" required {...f('department')} />
            <Select
              label="Level"
              options={[
                { value: 'undergraduate', label: 'Undergraduate' },
                { value: 'postgraduate', label: 'Postgraduate' },
                { value: 'diploma', label: 'Diploma' },
                { value: 'certificate', label: 'Certificate' },
                { value: 'phd', label: 'PhD' },
              ]}
              {...f('level')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Duration" required placeholder="e.g., 4 Years" {...f('duration')} />
            <Input label="Total Seats" required type="number" {...f('totalSeats')} />
          </div>
          <p className="text-sm font-medium text-gray-700 border-t pt-3">Fees (INR)</p>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Application Fee" type="number" {...f('applicationFee')} />
            <Input label="Tuition Fee" type="number" {...f('tuitionFee')} />
            <Input label="Registration Fee" type="number" {...f('registrationFee')} />
          </div>
          <Input label="Minimum Percentage" type="number" placeholder="e.g., 60" {...f('minPercentage')} />
          <Input label="Required Documents (comma-separated)" placeholder="marksheet_12, id_proof, photo" {...f('requiredDocuments')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>
              {editing ? 'Save Changes' : 'Create Program'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Program"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        variant="danger"
      />
    </div>
  );
}
