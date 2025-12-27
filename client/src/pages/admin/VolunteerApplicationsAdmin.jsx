import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  DocumentTextIcon,
  UserCircleIcon,
  TrashIcon,
  UsersIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronUpDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { volunteerApplicationsAPI } from '../../services/apiService';
import { showToast } from '../../utils/toast';

const VolunteerApplicationsAdmin = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedAppForAction, setSelectedAppForAction] = useState(null);
  const [interviewDetails, setInterviewDetails] = useState({
    date: '',
    time: '',
    mode: 'online',
    location: '',
    link: '',
    instructions: ''
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    'under-review': 0,
    shortlisted: 0,
    'interview-scheduled': 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  const searchTermRef = useRef('');
  const isInitialMount = useRef(true);

  const statusOptions = useMemo(() => [
    { value: 'all', label: 'All Status', color: 'gray' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'under-review', label: 'Under Review', color: 'blue' },
    { value: 'shortlisted', label: 'Shortlisted', color: 'purple' },
    { value: 'interview-scheduled', label: 'Interview Scheduled', color: 'indigo' },
    { value: 'approved', label: 'Approved', color: 'green' },
    { value: 'rejected', label: 'Rejected', color: 'red' }
  ], []);

  const dateOptions = useMemo(() => [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ], []);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: 10,
        sortBy: 'applicationDate',
        sortOrder: 'desc'
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (searchTermRef.current) {
        params.search = searchTermRef.current;
      }
      
      if (dateFilter !== 'all') {
        const now = new Date();
        const startDate = new Date();
        
        switch (dateFilter) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        params.startDate = startDate.toISOString();
        params.endDate = now.toISOString();
      }
      
      const response = await volunteerApplicationsAPI.getAll(params);
      
      if (response.data.success) {
        setApplications(response.data.data || []);
        setTotalPages(response.data.pagination?.pages || 1);
        setTotalApplications(response.data.pagination?.total || 0);
      } else {
        throw new Error(response.data.message || 'Failed to fetch applications');
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.response?.data?.message || 'Failed to load applications');
      showToast.error('Failed to load volunteer applications');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, dateFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await volunteerApplicationsAPI.getStats();
      if (response.data.success) {
        const statusStats = {};
        response.data.data?.statusStats?.forEach(stat => {
          statusStats[stat._id] = stat.count;
        });
        
        setStats({
          pending: statusStats.pending || 0,
          'under-review': statusStats['under-review'] || 0,
          shortlisted: statusStats.shortlisted || 0,
          'interview-scheduled': statusStats['interview-scheduled'] || 0,
          approved: statusStats.approved || 0,
          rejected: statusStats.rejected || 0,
          total: response.data.data?.total || 0
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  useEffect(() => {
    searchTermRef.current = searchTerm;
    
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchApplications();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, currentPage, fetchApplications]);

  useEffect(() => {
    if (!isInitialMount.current) {
      fetchApplications();
    }
  }, [statusFilter, dateFilter, currentPage, fetchApplications]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, []);

  const handleStatusUpdate = async (applicationId, status, notes = '', interviewData = null) => {
    try {
      setActionLoading(applicationId);
      
      const data = { status };
      if (notes) data.notes = notes;
      if (status === 'rejected' && rejectionReason) {
        data.rejectionReason = rejectionReason;
      }
      if (status === 'interview-scheduled' && interviewData) {
        data.interviewDetails = interviewData;
      }
      
      const response = await volunteerApplicationsAPI.updateStatus(applicationId, data);
      
      if (response.data.success) {
        setApplications(prev => prev.map(app => 
          app._id === applicationId ? { ...app, status, interviewDetails: interviewData } : app
        ));
        
        setShowInterviewModal(false);
        setShowRejectModal(false);
        setShowApproveModal(false);
        setSelectedAppForAction(null);
        setInterviewDetails({
          date: '',
          time: '',
          mode: 'online',
          location: '',
          link: '',
          instructions: ''
        });
        setRejectionReason('');
        
        fetchStats();
        
        showToast.success(`Application ${status} successfully`);
      } else {
        showToast.error(response.data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      showToast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleScheduleInterview = () => {
    if (!selectedAppForAction) return;
    
    // SIMPLIFIED - Only check bare minimum
    if (!interviewDetails.date || !interviewDetails.time) {
      showToast.error('Please fill in date and time');
      return;
    }
    
    handleStatusUpdate(selectedAppForAction._id, 'interview-scheduled', '', interviewDetails);
  };

  const handleDeleteApplication = async (applicationId) => {
    try {
      setActionLoading(applicationId);
      
      const response = await volunteerApplicationsAPI.delete(applicationId, {
        sendRejectionEmail: true,
        rejectionReason
      });
      
      if (response.data.success) {
        setApplications(prev => prev.filter(app => app._id !== applicationId));
        setShowDeleteModal(false);
        setSelectedAppForAction(null);
        setRejectionReason('');
        
        fetchStats();
        
        showToast.success('Application deleted successfully');
      } else {
        showToast.error(response.data.message || 'Failed to delete application');
      }
    } catch (err) {
      console.error('Error deleting application:', err);
      showToast.error(err.response?.data?.message || 'Failed to delete application');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveApplication = async () => {
    if (!selectedAppForAction) return;
    
    try {
      setActionLoading(selectedAppForAction._id);
      
      // SIMPLIFIED APPROVAL - NO CLIENT-SIDE VALIDATION
      const response = await volunteerApplicationsAPI.updateStatus(selectedAppForAction._id, {
        status: 'approved',
        notes: 'Application approved by admin'
      });
      
      if (response.data.success) {
        setApplications(prev => prev.map(app => 
          app._id === selectedAppForAction._id ? { ...app, status: 'approved' } : app
        ));
        
        setShowApproveModal(false);
        setSelectedAppForAction(null);
        
        fetchStats();
        
        showToast.success('Application approved successfully');
      } else {
        showToast.error(response.data.message || 'Failed to approve application');
      }
    } catch (err) {
      console.error('Error approving application:', err);
      showToast.error(err.response?.data?.message || 'Failed to approve application');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: ClockIcon },
      'under-review': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: EyeIcon },
      shortlisted: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: CheckCircleIcon },
      'interview-scheduled': { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: CalendarIcon },
      approved: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircleIcon },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircleIcon }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status?.replace('-', ' ')?.charAt(0)?.toUpperCase() + status?.replace('-', ' ')?.slice(1) || 'Unknown'}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Modal components
  const InterviewModal = useMemo(() => {
    const handleClose = () => {
      setShowInterviewModal(false);
      setInterviewDetails({
        date: '',
        time: '',
        mode: 'online',
        location: '',
        link: '',
        instructions: ''
      });
    };

    return showInterviewModal ? (
      <motion.div
        key="interview-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100/50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-primary-600" />
              Schedule Interview
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interview Date *</label>
              <input
                type="date"
                value={interviewDetails.date}
                onChange={(e) => setInterviewDetails(prev => ({...prev, date: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interview Time *</label>
              <input
                type="time"
                value={interviewDetails.time}
                onChange={(e) => setInterviewDetails(prev => ({...prev, time: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interview Mode</label>
              <select
                value={interviewDetails.mode}
                onChange={(e) => setInterviewDetails(prev => ({...prev, mode: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            
            {interviewDetails.mode === 'online' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                <input
                  type="url"
                  value={interviewDetails.link}
                  onChange={(e) => setInterviewDetails(prev => ({...prev, link: e.target.value}))}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            )}
            
            {interviewDetails.mode === 'offline' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={interviewDetails.location}
                  onChange={(e) => setInterviewDetails(prev => ({...prev, location: e.target.value}))}
                  placeholder="Office address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleScheduleInterview}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
              disabled={actionLoading === selectedAppForAction?._id}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              {actionLoading === selectedAppForAction?._id ? 'Scheduling...' : 'Schedule Interview'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    ) : null;
  }, [showInterviewModal, interviewDetails, selectedAppForAction, actionLoading]);

  const RejectModal = useMemo(() => {
    const handleClose = () => {
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedAppForAction(null);
    };

    return showRejectModal ? (
      <motion.div
        key="reject-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-red-50 to-red-100/50">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Reject Application</h3>
                <p className="text-sm text-gray-500">
                  Are you sure you want to reject this application?
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for rejection (optional)
              </label>
              <textarea
                id="rejectionReason"
                rows="3"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a reason for rejection..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => handleStatusUpdate(selectedAppForAction._id, 'rejected', 'Application rejected')}
              disabled={actionLoading === selectedAppForAction?._id}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <XCircleIcon className="w-4 h-4 mr-2" />
              {actionLoading === selectedAppForAction?._id ? 'Rejecting...' : 'Reject Application'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    ) : null;
  }, [showRejectModal, rejectionReason, selectedAppForAction, actionLoading]);

  const DeleteModal = useMemo(() => {
    const handleClose = () => {
      setShowDeleteModal(false);
      setRejectionReason('');
      setSelectedAppForAction(null);
    };

    return showDeleteModal ? (
      <motion.div
        key="delete-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-red-50 to-red-100/50">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Delete Application</h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone. All application data will be permanently deleted.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-600 font-medium">
                Warning: This action cannot be undone. All application data and documents will be permanently deleted.
              </p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="deleteReason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for deletion (optional)
              </label>
              <textarea
                id="deleteReason"
                rows="3"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason for deletion..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteApplication(selectedAppForAction._id)}
              disabled={actionLoading === selectedAppForAction?._id}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              {actionLoading === selectedAppForAction?._id ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    ) : null;
  }, [showDeleteModal, rejectionReason, selectedAppForAction, actionLoading]);

  const ApproveModal = useMemo(() => {
    const handleClose = () => {
      setShowApproveModal(false);
      setSelectedAppForAction(null);
    };

    return showApproveModal ? (
      <motion.div
        key="approve-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100/50">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Approve Application</h3>
                <p className="text-sm text-gray-500">
                  Are you sure you want to approve this application?
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-600 font-medium">
                This will create a volunteer account for the applicant.
              </p>
            </div>
            
            {selectedAppForAction && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Applicant Name</label>
                  <p className="font-medium">
                    {selectedAppForAction.personalInfo?.firstName} {selectedAppForAction.personalInfo?.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="font-medium">{selectedAppForAction.contactInfo?.email}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleApproveApplication}
              disabled={actionLoading === selectedAppForAction?._id}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              {actionLoading === selectedAppForAction?._id ? 'Approving...' : 'Approve Application'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    ) : null;
  }, [showApproveModal, selectedAppForAction, actionLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <motion.h1 
              className="text-3xl font-bold text-gray-900"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Volunteer Applications
            </motion.h1>
            <motion.p 
              className="text-gray-600 mt-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Review and manage volunteer applications
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center space-x-2 text-primary-600 bg-primary-50 px-4 py-2 rounded-lg border border-primary-200"
          >
            <DocumentTextIcon className="h-5 w-5" />
            <span className="font-semibold">{stats.total} Applications</span>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {statusOptions.filter(s => s.value !== 'all').map((status) => (
            <motion.div
              key={status.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => setStatusFilter(status.value)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{stats[status.value] || 0}</p>
                    <p className="text-sm text-gray-600">{status.label}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${status.color === 'yellow' ? 'bg-yellow-100' : 
                    status.color === 'blue' ? 'bg-blue-100' : 
                    status.color === 'purple' ? 'bg-purple-100' : 
                    status.color === 'indigo' ? 'bg-indigo-100' : 
                    status.color === 'green' ? 'bg-green-100' : 
                    'bg-red-100'}`}>
                    {status.value === 'pending' && <ClockIcon className={`w-5 h-5 ${status.color === 'yellow' ? 'text-yellow-600' : 'text-gray-600'}`} />}
                    {status.value === 'under-review' && <EyeIcon className="w-5 h-5 text-blue-600" />}
                    {status.value === 'shortlisted' && <CheckCircleIcon className="w-5 h-5 text-purple-600" />}
                    {status.value === 'interview-scheduled' && <CalendarIcon className="w-5 h-5 text-indigo-600" />}
                    {status.value === 'approved' && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
                    {status.value === 'rejected' && <XCircleIcon className="w-5 h-5 text-red-600" />}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-r from-primary-600 to-secondary-700 shadow-lg rounded-xl text-white"
          >
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">{stats.total}</p>
                  <p className="text-sm opacity-90">Total</p>
                </div>
                <div className="p-2 rounded-lg bg-primary-500/30">
                  <UsersIcon className="w-5 h-5" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <motion.div 
          className="bg-white shadow-lg rounded-xl border border-gray-200 p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-primary-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronUpDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Date Filter */}
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
              >
                {dateOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronUpDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchApplications}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 font-medium flex items-center justify-center"
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Applications Table */}
        <motion.div 
          className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100/50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2 text-primary-600" />
              Volunteer Applications ({totalApplications})
            </h3>
          </div>

          {loading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-4 items-center">
                    <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              <ExclamationTriangleIcon className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">{error}</p>
              <button
                onClick={fetchApplications}
                className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <UserCircleIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No applications found</p>
              <p className="text-sm mt-1">Try changing your filters or search term</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Education & Skills
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Applied On
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application, index) => (
                    <motion.tr
                      key={application._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-primary-50/30 transition-colors duration-150 group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                            <span className="text-white font-medium">
                              {application.personalInfo?.firstName?.charAt(0)}
                              {application.personalInfo?.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-primary-700 transition-colors duration-200">
                              {application.personalInfo?.firstName} {application.personalInfo?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.age} years • {application.personalInfo?.gender}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {application.contactInfo?.email}
                        </div>
                        <div className="text-sm text-gray-500">{application.contactInfo?.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 capitalize">
                          {application.educationInfo?.highestEducation?.replace('-', ' ')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.professionalInfo?.skills?.slice(0, 2).join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(application.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(application.applicationDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/admin/volunteer-applications/${application._id}`}
                            className="inline-flex items-center p-2 border border-primary-300 text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                            title="View Full Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          
                          {application.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedAppForAction(application);
                                  setShowInterviewModal(true);
                                }}
                                className="inline-flex items-center p-2 border border-transparent text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                title="Schedule Interview"
                              >
                                <CalendarIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAppForAction(application);
                                  setShowRejectModal(true);
                                }}
                                className="inline-flex items-center p-2 border border-transparent text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-lg hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                                title="Reject Application"
                              >
                                <XCircleIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAppForAction(application);
                                  setShowApproveModal(true);
                                }}
                                className="inline-flex items-center p-2 border border-transparent text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                                title="Approve Application"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          
                          {application.status === 'interview-scheduled' && (
                            <button
                              onClick={() => {
                                setSelectedAppForAction(application);
                                setShowApproveModal(true);
                              }}
                              className="inline-flex items-center p-2 border border-transparent text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                              title="Approve Application"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => {
                              setSelectedAppForAction(application);
                              setShowDeleteModal(true);
                            }}
                            className="inline-flex items-center p-2 border border-gray-300 text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                            title="Delete Application"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {applications.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * 10, totalApplications)}</span> of{' '}
                <span className="font-medium">{totalApplications}</span> applications
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        currentPage === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      {InterviewModal}
      {RejectModal}
      {ApproveModal}
      {DeleteModal}
    </div>
  );
};

export default VolunteerApplicationsAdmin;