import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistance } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = 'MMM dd, yyyy'): string {
  if (!date) return '-';
  return format(new Date(date), fmt);
}

export function formatDateTime(date: string | Date): string {
  if (!date) return '-';
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
}

export function timeAgo(date: string | Date): string {
  if (!date) return '-';
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    submitted: 'bg-blue-100 text-blue-700',
    under_review: 'bg-yellow-100 text-yellow-700',
    documents_pending: 'bg-orange-100 text-orange-700',
    eligible: 'bg-green-100 text-green-700',
    ineligible: 'bg-red-100 text-red-700',
    shortlisted: 'bg-teal-100 text-teal-700',
    accepted: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    waitlisted: 'bg-purple-100 text-purple-700',
    enrolled: 'bg-indigo-100 text-indigo-700',
    withdrawn: 'bg-gray-100 text-gray-500',
    // Document statuses
    pending: 'bg-yellow-100 text-yellow-700',
    verified: 'bg-green-100 text-green-700',
    // Payment statuses
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-orange-100 text-orange-700',
    // Inquiry statuses
    new: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-500',
    // User statuses
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-500',
    suspended: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

export function formatStatusLabel(status: string): string {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function truncate(text: string, length = 50): string {
  if (!text) return '';
  return text.length > length ? `${text.substring(0, length)}...` : text;
}
