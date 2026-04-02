'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { Upload, FileText, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { formatFileSize, formatDate } from '@/lib/utils';
import type { Document as AppDocument } from '@/types';

const DOCUMENT_TYPES = [
  { value: 'photo', label: 'Passport Photo' },
  { value: 'id_proof', label: 'ID Proof (Aadhaar / Passport)' },
  { value: 'marksheet_10', label: '10th Marksheet' },
  { value: 'marksheet_12', label: '12th Marksheet' },
  { value: 'degree_certificate', label: 'Degree Certificate' },
  { value: 'transcript', label: 'Academic Transcript' },
  { value: 'transfer_certificate', label: 'Transfer Certificate' },
  { value: 'migration_certificate', label: 'Migration Certificate' },
  { value: 'income_certificate', label: 'Income Certificate (for scholarship)' },
  { value: 'category_certificate', label: 'Category Certificate (SC/ST/OBC)' },
  { value: 'other', label: 'Other Document' },
];

const StatusIcon = ({ status }: { status: string }) => {
  if (status === 'verified') return <CheckCircle className="w-4 h-4 text-green-500" />;
  if (status === 'rejected') return <XCircle className="w-4 h-4 text-red-500" />;
  return <Clock className="w-4 h-4 text-amber-400" />;
};

export default function StudentDocumentsPage() {
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const fetchDocs = () => {
    api.documents
      .getMy()
      .then((res) => setDocuments((res.data as any).data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDocs(); }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setPendingFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!pendingFile) { toast.error('Please select a file.'); return; }
    if (!selectedType) { toast.error('Please select a document type.'); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', pendingFile);
      formData.append('type', selectedType);
      formData.append('name', DOCUMENT_TYPES.find((d) => d.value === selectedType)?.label || selectedType);

      await api.documents.upload(formData);
      toast.success('Document uploaded successfully!');
      setPendingFile(null);
      setSelectedType('');
      fetchDocs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.documents.delete(id);
      toast.success('Document deleted.');
      setDocuments((prev) => prev.filter((d) => d._id !== id));
    } catch {
      toast.error('Failed to delete document.');
    }
  };

  return (
    <div className="container-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
        <p className="text-gray-500 mt-1">Upload and manage your admission documents</p>
      </div>

      {/* Upload Card */}
      <Card title="Upload a Document" className="mb-6">
        <div className="space-y-4">
          <Select
            label="Document Type"
            required
            options={[{ value: '', label: 'Select document type...' }, ...DOCUMENT_TYPES]}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          />

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            {pendingFile ? (
              <div>
                <p className="font-medium text-gray-800">{pendingFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(pendingFile.size)}</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 font-medium">
                  {isDragActive ? 'Drop your file here' : 'Drag & drop or click to select'}
                </p>
                <p className="text-sm text-gray-400 mt-1">PDF, JPG, PNG — max 10MB</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            {pendingFile && (
              <Button variant="ghost" onClick={() => setPendingFile(null)}>Clear</Button>
            )}
            <Button
              variant="primary"
              loading={uploading}
              disabled={!pendingFile || !selectedType}
              onClick={handleUpload}
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Documents List */}
      <Card title="Uploaded Documents">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>No documents uploaded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <div key={doc._id} className="py-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatFileSize(doc.fileSize)} · Uploaded {formatDate(doc.createdAt!)}
                  </p>
                  {doc.remarks && (
                    <p className="text-xs text-amber-600 mt-0.5">Note: {doc.remarks}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <StatusIcon status={doc.status} />
                    <Badge status={doc.status} />
                  </div>
                  {doc.status !== 'verified' && (
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
