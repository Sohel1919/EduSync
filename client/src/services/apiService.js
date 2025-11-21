import axios from 'axios';
import { axiosConfig } from '../utils/axiosConfig';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/signin';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  // Authentication
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  resendVerification: (data) => api.post('/auth/resend-verification', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  
  // Profile Management
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  deleteAccount: () => api.delete('/auth/account'),
  
  // Role management (if needed)
  updateRole: (roleData) => api.put('/auth/role', roleData),
};

export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getAdminProjects: (params = {}) => api.get('/projects/admin/all-projects', { params }),
  getCompleteStats: (params = {}) => api.get('/projects/admin/complete-stats', { params }),
};

export const beneficiariesAPI = {
  getAll: () => api.get('/beneficiaries'),
  getById: (id) => api.get(`/beneficiaries/${id}`),
  create: (data) => api.post('/beneficiaries', data),
  update: (id, data) => api.put(`/beneficiaries/${id}`, data),
};

export const donationsAPI = {
  getAll: () => api.get('/donations'),
  create: (data) => api.post('/donations', data),
  getByUser: () => api.get('/donations/user'),
};

export default api;