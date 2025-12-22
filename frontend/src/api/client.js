import axios from 'axios';
import { trackAPIError } from '../utils/errorTracker';

const API_BASE_URL = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and track requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add request ID for tracking
    config.metadata = {
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: Date.now()
    };
    return config;
  },
  (error) => {
    trackAPIError({
      endpoint: error.config?.url || 'unknown',
      method: error.config?.method?.toUpperCase() || 'UNKNOWN',
      error,
      context: { phase: 'request_setup' }
    });
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and tracking
apiClient.interceptors.response.use(
  (response) => {
    // Track successful request timing (silently)
    return response;
  },
  (error) => {
    const config = error.config || {};
    const duration = Date.now() - (config.metadata?.startTime || 0);

    // Track API error with full details
    trackAPIError({
      endpoint: config.url || 'unknown',
      method: config.method?.toUpperCase() || 'UNKNOWN',
      error,
      requestData: config.data,
      context: {
        requestId: config.metadata?.requestId,
        duration,
        baseURL: config.baseURL,
        headers: config.headers
      }
    });

    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getMe: () => apiClient.get('/auth/me'),
};

// Jobs API
export const jobsAPI = {
  search: (params) => apiClient.get('/jobs', { params }),
  getById: (id) => apiClient.get(`/jobs/${id}`),
  create: (data) => apiClient.post('/jobs', data),
  update: (id, data) => apiClient.put(`/jobs/${id}`, data),
  delete: (id) => apiClient.delete(`/jobs/${id}`),
};

// Companies API
export const companiesAPI = {
  getAll: (params) => apiClient.get('/companies', { params }),
  getById: (id) => apiClient.get(`/companies/${id}`),
  getMy: () => apiClient.get('/companies/my-companies'),
  create: (data) => apiClient.post('/companies', data),
  update: (id, data) => apiClient.put(`/companies/${id}`, data),
  delete: (id) => apiClient.delete(`/companies/${id}`),
};

// Applications API
export const applicationsAPI = {
  apply: (jobId, formData) => {
    return apiClient.post(`/applications/jobs/${jobId}/apply`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getMy: () => apiClient.get('/applications/my-applications'),
  getForEmployer: (params) => apiClient.get('/applications/employer/applications', { params }),
  updateStatus: (id, data) => apiClient.put(`/applications/${id}/status`, data),
  getById: (id) => apiClient.get(`/applications/${id}`),
};

// Users API
export const usersAPI = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data) => apiClient.put('/users/profile', data),
  getPublicProfile: (id) => apiClient.get(`/users/profile/${id}`),
};

// Admin API
export const adminAPI = {
  getUsers: (params) => apiClient.get('/admin/users', { params }),
  updateUserStatus: (id, data) => apiClient.put(`/admin/users/${id}/status`, data),
  updateUserRole: (id, data) => apiClient.put(`/admin/users/${id}/role`, data),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
  getStats: () => apiClient.get('/admin/stats'),
  getPendingEmployers: () => apiClient.get('/admin/pending-employers'),
  approveEmployer: (id) => apiClient.post(`/admin/approve-employer/${id}`),
  rejectEmployer: (id) => apiClient.delete(`/admin/reject-employer/${id}`),
  getCompanies: (params) => apiClient.get('/admin/companies', { params }),
  deleteCompany: (id) => apiClient.delete(`/admin/companies/${id}`),
};

export default apiClient;
