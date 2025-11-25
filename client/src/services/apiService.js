import axios from 'axios';

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
    
    // Log request for debugging
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Handle auth errors and responses
api.interceptors.response.use(
  (response) => {
    console.log('API Response Success:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/signin';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  // Authentication
  register: (userData) => {
    console.log('Register API call:', userData);
    return api.post('/auth/register', userData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  login: (credentials) => api.post('/auth/login', credentials),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  resendVerification: (data) => api.post('/auth/resend-verification', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  
  // Profile Management
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => {
    console.log('Update Profile API call:', data);
    return api.put('/auth/profile', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
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

// Updated Volunteers API to match backend routes
export const volunteersAPI = {
  // Get all volunteers (protected route)
  getAll: (params = {}) => api.get('/volunteers', { params }),
  
  // Get volunteer by ID (protected route)
  getById: (id) => api.get(`/volunteers/${id}`),
  
  // Create new volunteer (public route)
  create: (formData) => {
    return api.post('/volunteers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Update volunteer (protected route - admin only)
  update: (id, formData) => {
    return api.put(`/volunteers/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Delete volunteer (protected route - admin only)
  delete: (id) => api.delete(`/volunteers/${id}`),
  
  // Update volunteer status (protected route - admin only)
  updateStatus: (id, status) => api.patch(`/volunteers/${id}/status`, { status }),
  
  // Admin specific endpoints
  getAdminVolunteers: (params = {}) => api.get('/volunteers', { params }),
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