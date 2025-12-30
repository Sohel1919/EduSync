import axios from 'axios';

const API_BASE_URL = import.meta.env.BACKEND_URL || 'https://edusync-wwn9.onrender.com/api';

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

// Handle auth errors and responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
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
  register: (userData) => {
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

// Volunteer Applications API - NEW SECTION
export const volunteerApplicationsAPI = {
  // Submit new volunteer application with file upload
  create: (formData) => {
    return api.post('/volunteer-applications/apply', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for file uploads
    });
  },
  
  // Get all applications (Admin only)
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    return api.get(`/volunteer-applications?${queryParams.toString()}`);
  },
  
  // Get application by ID
  getById: (id) => api.get(`/volunteer-applications/${id}`),
  
  // Get user's own applications
  getMyApplications: () => api.get('/volunteer-applications/my-applications'),
  
  // Update application status (Admin only)
  updateStatus: (id, data) => api.patch(`/volunteer-applications/${id}/status`, data),
  
  // Update interview details (Admin only)
  updateInterview: (id, data) => api.patch(`/volunteer-applications/${id}/interview`, data),
  
  // Add note to application (Admin only)
  addNote: (id, note) => api.post(`/volunteer-applications/${id}/notes`, { note }),
  
  // Get application statistics (Admin only)
  getStats: () => api.get('/volunteer-applications/stats/overview'),
  
  // Get dashboard statistics (Admin only)
  getDashboardStats: () => api.get('/volunteer-applications/stats/dashboard'),
  
  // Export applications (Admin only)
  exportApplications: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    return api.get(`/volunteer-applications/export/applications?${queryParams.toString()}`);
  },
  
  // Delete application (Admin only)
  delete: (id, data = {}) => api.delete(`/volunteer-applications/${id}`, { data }),
  
  // Convenience methods for specific actions
  scheduleInterview: (id, interviewData) => 
    api.patch(`/volunteer-applications/${id}/status`, {
      status: 'interview-scheduled',
      interviewDetails: interviewData
    }),
  
  approveApplication: (id, notes = '') => 
    api.patch(`/volunteer-applications/${id}/status`, {
      status: 'approved',
      notes
    }),
  
  rejectApplication: (id, rejectionReason = '', notes = '') => 
    api.patch(`/volunteer-applications/${id}/status`, {
      status: 'rejected',
      rejectionReason,
      notes
    }),
  
  shortlistApplication: (id, notes = '') => 
    api.patch(`/volunteer-applications/${id}/status`, {
      status: 'shortlisted',
      notes
    }),
  
  markUnderReview: (id, notes = '') => 
    api.patch(`/volunteer-applications/${id}/status`, {
      status: 'under-review',
      notes
    })
};

// Beneficiaries API
export const beneficiariesAPI = {
  // Create beneficiary application with file upload
  create: (formData) => {
    return api.post('/beneficiaries/applications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for file uploads
    });
  },
  
  // BENEFICIARY DASHBOARD ENDPOINTS (NEW)
  getDashboard: () => api.get('/beneficiaries/dashboard'),
  getDashboardStats: () => api.get('/beneficiaries/dashboard/stats'),
  getDashboardProjects: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    return api.get(`/beneficiaries/dashboard/projects?${queryParams.toString()}`);
  },
  
  // Get user's beneficiary applications
  getMyApplications: () => api.get('/beneficiaries/my-applications'),
  
  // Get beneficiary applications for a project (project creator only)
  getProjectApplications: (projectId) => api.get(`/beneficiaries/project/${projectId}`),
  
  // Get single beneficiary application
  getById: (beneficiaryId) => api.get(`/beneficiaries/${beneficiaryId}`),
  
  // Update beneficiary application status (project creator only)
  updateStatus: (beneficiaryId, data) => api.patch(`/beneficiaries/${beneficiaryId}/status`, data),
  
  // Delete beneficiary application (applicant only)
  delete: (beneficiaryId) => api.delete(`/beneficiaries/${beneficiaryId}`),
  
  // VOLUNTEER METHODS - Get applications for volunteer's projects
  getVolunteerApplications: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'all') {
        params.append(key, filters[key]);
      }
    });
    return api.get(`/beneficiaries/volunteer/my-projects/applications?${params.toString()}`);
  },
  
  // ADMIN METHODS
  // Get all beneficiary applications (Admin only)
  getAllApplications: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'all') {
        params.append(key, filters[key]);
      }
    });
    return api.get(`/beneficiaries/admin/applications?${params.toString()}`);
  },
  
  // Bulk update application status (Admin only)
  bulkUpdateStatus: (applicationIds, status, reviewNotes = '') => 
    api.patch('/beneficiaries/admin/bulk-status', {
      applicationIds,
      status,
      reviewNotes
    })
};

export const notificationsAPI = {
  get: (params) => api.get('/notifications', { params }),
  markAsRead: (notificationId) => api.patch(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (notificationId) => api.delete(`/notifications/${notificationId}`)
};

export const projectRequestsAPI = {
  // Get all project requests (public route)
  getAll: (params = {}) => api.get('/project-requests', { params }),
  
  // Get single project request by ID (public route)
  getById: (id) => api.get(`/project-requests/${id}`),
  
  // Create new project request (protected route)
  create: (formData) => {
    return api.post('/project-requests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Update project request (protected route - owner or admin)
  update: (id, formData) => {
    return api.put(`/project-requests/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Delete project request (protected route - owner or admin)
  delete: (id) => api.delete(`/project-requests/${id}`),
  
  // Delete rejected project (for project owner)
  deleteRejected: (id) => api.delete(`/project-requests/rejected/${id}`),
  
  // Get user's project requests (protected route)
  getMyProjects: () => api.get('/project-requests/user/my-projects'),
  
  // Admin: Get all project requests with filtering (admin only)
  getAdminProjects: (params = {}) => api.get('/project-requests/admin/all-projects', { params }),
  
  // Admin: Update project request status (admin only)
  updateStatus: (id, statusData) => api.patch(`/project-requests/${id}/status`, statusData),
};

// Updated Donations API to match backend routes
export const donationsAPI = {
  // Check payment gateway status
  getStatus: () => api.get('/donations/status'),
  
  // Create donation order
  createOrder: (orderData) => api.post('/donations/create-order', orderData),
  
  // Verify payment
  verifyPayment: (paymentData) => api.post('/donations/verify-payment', paymentData),
  
  // Get user donation history
  getUserDonations: (params = {}) => api.get('/donations/my-donations', { params }),
  
  // Get donation statistics - THIS IS CRITICAL
  getStatistics: () => api.get('/donations/statistics'),
  
  // Get donation by ID
  getById: (id) => api.get(`/donations/${id}`),
  
  // Get all donations (Admin only)
  getAllDonations: (params = {}) => api.get('/donations/admin/all', { params }),
  
  // Get donation receipt
  getReceipt: (donationId) => api.get(`/donations/${donationId}/receipt`),

  getDonorDashboard: () => api.get('/donor-dashboard'),
  
  // Get donor statistics for stats cards
  getDonorStats: () => api.get('/donor-dashboard/stats'),
  
  // Get donor's donations with pagination
  getDonorDonations: (params = {}) => api.get('/donor-dashboard/donations', { params }),
  
  // Get donor's impact data
  getDonorImpact: () => api.get('/donor-dashboard/impact'),
  
  // Get donor profile
  getDonorProfile: () => api.get('/donor-dashboard/profile'),
  
  // Update getUserStatistics to use new endpoint
  getUserStatistics: (userId) => api.get('/donor-dashboard/stats'),
};

// Dashboard API for consolidated stats
export const dashboardAPI = {
  getAdminStats: () => api.get('/dashboard/admin/stats'),
  getVolunteerStats: () => api.get('/dashboard/volunteer/stats'),
  getDonorStats: () => api.get('/dashboard/donor/stats'),
  getBeneficiaryStats: () => api.get('/dashboard/beneficiary/stats'),
};

export default api;