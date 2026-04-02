import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';
import { clearClientAuth } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const currentPath = `${window.location.pathname}${window.location.search}`;
        const isAuthPage =
          window.location.pathname.startsWith('/login') ||
          window.location.pathname.startsWith('/register');

        clearClientAuth();

        if (!isAuthPage) {
          const redirect = encodeURIComponent(currentPath);
          window.location.replace(`/login?redirect=${redirect}`);
        }
      }
    }
    return Promise.reject(error);
  },
);

export const api = {
  // Auth
  auth: {
    register: (data: any) => apiClient.post<ApiResponse<any>>('/auth/register', data),
    login: (data: any) => apiClient.post<ApiResponse<any>>('/auth/login', data),
    getProfile: () => apiClient.get<ApiResponse<any>>('/auth/profile'),
    updateProfile: (data: any) => apiClient.put<ApiResponse<any>>('/auth/profile', data),
    changePassword: (data: any) => apiClient.patch<ApiResponse<any>>('/auth/change-password', data),
  },

  // Users
  users: {
    getAll: (params?: any) => apiClient.get<ApiResponse<any>>('/users', { params }),
    getOne: (id: string) => apiClient.get<ApiResponse<any>>(`/users/${id}`),
    create: (data: any) => apiClient.post<ApiResponse<any>>('/users', data),
    update: (id: string, data: any) => apiClient.patch<ApiResponse<any>>(`/users/${id}`, data),
    delete: (id: string) => apiClient.delete<ApiResponse<any>>(`/users/${id}`),
    getStats: () => apiClient.get<ApiResponse<any>>('/users/stats'),
  },

  // Programs
  programs: {
    getAll: (params?: any) => apiClient.get<ApiResponse<any>>('/programs', { params }),
    getOne: (id: string) => apiClient.get<ApiResponse<any>>(`/programs/${id}`),
    create: (data: any) => apiClient.post<ApiResponse<any>>('/programs', data),
    update: (id: string, data: any) => apiClient.patch<ApiResponse<any>>(`/programs/${id}`, data),
    delete: (id: string) => apiClient.delete<ApiResponse<any>>(`/programs/${id}`),
    getDepartments: () => apiClient.get<ApiResponse<any>>('/programs/departments'),
  },

  // Applications
  applications: {
    getAll: (params?: any) => apiClient.get<ApiResponse<any>>('/applications', { params }),
    getMy: (params?: any) => apiClient.get<ApiResponse<any>>('/applications/my', { params }),
    getOne: (id: string) => apiClient.get<ApiResponse<any>>(`/applications/${id}`),
    create: (data: any) => apiClient.post<ApiResponse<any>>('/applications', data),
    submit: (id: string) => apiClient.patch<ApiResponse<any>>(`/applications/${id}/submit`),
    updateStatus: (id: string, data: any) => apiClient.patch<ApiResponse<any>>(`/applications/${id}/status`, data),
    checkEligibility: (id: string, data: any) => apiClient.patch<ApiResponse<any>>(`/applications/${id}/eligibility`, data),
    assign: (id: string, staffId: string) => apiClient.patch<ApiResponse<any>>(`/applications/${id}/assign`, { staffId }),
    withdraw: (id: string) => apiClient.patch<ApiResponse<any>>(`/applications/${id}/withdraw`),
    getStats: () => apiClient.get<ApiResponse<any>>('/applications/stats'),
  },

  // Documents
  documents: {
    upload: (formData: FormData) =>
      apiClient.post<ApiResponse<any>>('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    getMy: () => apiClient.get<ApiResponse<any>>('/documents/my'),
    getByApplication: (applicationId: string) =>
      apiClient.get<ApiResponse<any>>(`/documents/application/${applicationId}`),
    getAll: (params?: any) => apiClient.get<ApiResponse<any>>('/documents', { params }),
    verify: (id: string, data: { status: string; remarks?: string }) =>
      apiClient.patch<ApiResponse<any>>(`/documents/${id}/verify`, data),
    delete: (id: string) => apiClient.delete<ApiResponse<any>>(`/documents/${id}`),
  },

  // Payments
  payments: {
    initiate: (data: any) => apiClient.post<ApiResponse<any>>('/payments/initiate', data),
    confirm: (id: string, data: any) => apiClient.patch<ApiResponse<any>>(`/payments/${id}/confirm`, data),
    fail: (id: string, reason: string) => apiClient.patch<ApiResponse<any>>(`/payments/${id}/fail`, { reason }),
    getMy: (params?: any) => apiClient.get<ApiResponse<any>>('/payments/my', { params }),
    getByApplication: (applicationId: string) =>
      apiClient.get<ApiResponse<any>>(`/payments/application/${applicationId}`),
    getAll: (params?: any) => apiClient.get<ApiResponse<any>>('/payments', { params }),
    getRevenue: () => apiClient.get<ApiResponse<any>>('/payments/revenue'),
  },

  // Inquiries
  inquiries: {
    create: (data: any, studentId?: string) =>
      apiClient.post<ApiResponse<any>>('/inquiries', data, {
        params: studentId ? { studentId } : undefined,
      }),
    getMy: (params?: any) => apiClient.get<ApiResponse<any>>('/inquiries/my', { params }),
    getAll: (params?: any) => apiClient.get<ApiResponse<any>>('/inquiries', { params }),
    getOne: (id: string) => apiClient.get<ApiResponse<any>>(`/inquiries/${id}`),
    respond: (id: string, data: any) => apiClient.post<ApiResponse<any>>(`/inquiries/${id}/respond`, data),
    updateStatus: (id: string, data: any) => apiClient.patch<ApiResponse<any>>(`/inquiries/${id}/status`, data),
    getStats: () => apiClient.get<ApiResponse<any>>('/inquiries/stats'),
  },
};

export default apiClient;
