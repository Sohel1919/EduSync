import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { FaFolder, FaUsers, FaRupeeSign, FaCalendar, FaMapMarkerAlt } from 'react-icons/fa';
import ProjectDetailsModal from './components/ProjectDetailsModal';
import { projectRequestsAPI } from '../../services/apiService';
import { showToast } from '../../utils/toast';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
];

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'education', label: 'Education' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'empowerment', label: 'Empowerment' },
  { value: 'environment', label: 'Environment' },
  { value: 'disaster-relief', label: 'Disaster Relief' },
  { value: 'animal-welfare', label: 'Animal Welfare' },
  { value: 'elderly-care', label: 'Elderly Care' },
  { value: 'child-development', label: 'Child Development' }
];

// Add this function to calculate progress properly
const calculateProgress = (request) => {
  // If progress is directly provided, use it
  if (request.progress !== undefined && request.progress !== null) {
    return Math.min(100, Math.max(0, Number(request.progress) || 0));
  }
  
  // Calculate from currentAmount and targetAmount
  if (request.currentAmount && request.targetAmount) {
    const progress = (request.currentAmount / request.targetAmount) * 100;
    return Math.min(100, Math.max(0, Math.round(progress)));
  }
  
  // Default to 0 if no data available
  return 0;
};

export default function AdminProjectRequests() {
  const [projectRequests, setProjectRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [projectToAction, setProjectToAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Fetch project requests from API
  const fetchProjectRequests = async () => {
    try {
      setLoading(true);
      const response = await projectRequestsAPI.getAdminProjects();
      
      let requestsData = [];
      
      if (Array.isArray(response.data)) {
        requestsData = response.data;
      } else if (response.data && Array.isArray(response.data.projects)) {
        requestsData = response.data.projects;
      } else if (response.data && Array.isArray(response.data.data)) {
        requestsData = response.data.data;
      } else {
        requestsData = [];
      }
      
      // Ensure progress is calculated for each request
      const requestsWithProgress = requestsData.map(request => ({
        ...request,
        calculatedProgress: calculateProgress(request)
      }));
      
      console.log('Fetched project requests with progress:', requestsWithProgress);
      setProjectRequests(requestsWithProgress);
      setFilteredRequests(requestsWithProgress);
    } catch (error) {
      console.error('Error fetching project requests:', error);
      showToast.error('Failed to load project requests');
      setProjectRequests([]);
      setFilteredRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectRequests();
  }, []);

  // Filter and search requests
  useEffect(() => {
    let filtered = projectRequests.filter(request => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        request.title?.toLowerCase().includes(searchLower) ||
        request.organization?.toLowerCase().includes(searchLower) ||
        request.createdBy?.name?.toLowerCase().includes(searchLower) ||
        request.location?.toLowerCase().includes(searchLower);
      
      const matchesStatus = selectedStatus === 'all' || request.isApproved === selectedStatus;
      const matchesCategory = selectedCategory === 'all' || request.category === selectedCategory;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });

    setFilteredRequests(filtered);
  }, [projectRequests, searchTerm, selectedStatus, selectedCategory]);

  // Handle approve project - UPDATED
  const handleApprove = async (projectId) => {
    try {
      setActionLoading(projectId);
      
      console.log('Approving project:', projectId);
      
      // Call API to approve project - FIXED: sending proper data structure
      const response = await projectRequestsAPI.updateStatus(projectId, { 
        isApproved: 'approved'
      });
      
      console.log('Approve API response:', response);
      
      if (response.data && response.data.success) {
        // Update local state
        setProjectRequests(prev => 
          prev.map(req => 
            req._id === projectId 
              ? { ...req, isApproved: 'approved' }
              : req
          )
        );
        
        showToast.success('Project approved successfully!');
        
        console.log('Project approved and notification sent to owner');
      } else {
        throw new Error(response.data?.message || 'Failed to approve project');
      }
    } catch (error) {
      console.error('Error approving project:', error);
      console.error('Error details:', error.response?.data);
      showToast.error(error.response?.data?.message || error.message || 'Failed to approve project');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle reject project - UPDATED
  const handleReject = async (projectId, reason = '') => {
    try {
      setActionLoading(projectId);
      
      console.log('Rejecting project:', projectId, 'Reason:', reason);
      
      // Call API to reject project - FIXED: sending proper data structure
      const response = await projectRequestsAPI.updateStatus(projectId, { 
        isApproved: 'rejected',
        rejectionReason: reason
      });
      
      console.log('Reject API response:', response);
      
      if (response.data && response.data.success) {
        // Update local state
        setProjectRequests(prev => 
          prev.map(req => 
            req._id === projectId 
              ? { 
                  ...req, 
                  isApproved: 'rejected',
                  rejectionReason: reason 
                }
              : req
          )
        );
        
        showToast.success('Project rejected successfully!');
        
        console.log('Project rejected and notification sent to owner');
      } else {
        throw new Error(response.data?.message || 'Failed to reject project');
      }
    } catch (error) {
      console.error('Error rejecting project:', error);
      console.error('Error details:', error.response?.data);
      showToast.error(error.response?.data?.message || error.message || 'Failed to reject project');
    } finally {
      setActionLoading(null);
      setShowRejectModal(false);
      setRejectionReason('');
      setProjectToAction(null);
    }
  };

  // Open reject confirmation modal
  const openRejectModal = (project) => {
    setProjectToAction(project);
    setShowRejectModal(true);
  };

  // Confirm rejection with reason
  const confirmReject = () => {
    if (projectToAction) {
      handleReject(projectToAction._id, rejectionReason);
    }
  };

  const openDetails = (request) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedRequest(null);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
        {status?.charAt(0)?.toUpperCase() + status?.slice(1) || 'Unknown'}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const styles = {
      education: 'bg-blue-50 text-blue-700 border-blue-200',
      healthcare: 'bg-green-50 text-green-700 border-green-200',
      empowerment: 'bg-purple-50 text-purple-700 border-purple-200',
      environment: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'disaster-relief': 'bg-red-50 text-red-700 border-red-200',
      'animal-welfare': 'bg-orange-50 text-orange-700 border-orange-200',
      'elderly-care': 'bg-pink-50 text-pink-700 border-pink-200',
      'child-development': 'bg-cyan-50 text-cyan-700 border-cyan-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[category] || 'bg-gray-50 text-gray-700'}`}>
        {category?.split('-')?.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Uncategorized'}
      </span>
    );
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  // Stats calculation
  const stats = {
    total: projectRequests.length,
    pending: projectRequests.filter(req => req.isApproved === 'pending').length,
    approved: projectRequests.filter(req => req.isApproved === 'approved').length,
    rejected: projectRequests.filter(req => req.isApproved === 'rejected').length
  };

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
              Project Requests
            </motion.h1>
            <motion.p 
              className="text-gray-600 mt-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Review and manage project submissions from volunteers
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center space-x-2 text-primary-600 bg-primary-50 px-4 py-2 rounded-lg border border-primary-200"
          >
            <DocumentTextIcon className="h-5 w-5" />
            <span className="font-semibold">{stats.total} Requests</span>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { 
              name: 'Total Requests', 
              value: stats.total, 
              icon: FaFolder, 
              color: 'from-primary-500 to-primary-600',
              bgColor: 'bg-primary-50'
            },
            { 
              name: 'Pending Review', 
              value: stats.pending, 
              icon: ClockIcon, 
              color: 'from-yellow-500 to-amber-600',
              bgColor: 'bg-yellow-50'
            },
            { 
              name: 'Approved', 
              value: stats.approved, 
              icon: CheckCircleIcon, 
              color: 'from-green-500 to-emerald-600',
              bgColor: 'bg-green-50'
            },
            { 
              name: 'Rejected', 
              value: stats.rejected, 
              icon: XCircleIcon, 
              color: 'from-red-500 to-rose-600',
              bgColor: 'bg-red-50'
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} text-white`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters and Search */}
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
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Reset Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 border border-primary-300 text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 font-medium"
            >
              Reset Filters
            </button>
          </div>
        </motion.div>

        {/* Projects Table */}
        <motion.div 
          className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100/50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2 text-primary-600" />
              Project Requests ({filteredRequests.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-4 items-center">
                    <div className="rounded-lg bg-gray-200 h-12 w-12"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No project requests found</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                {searchTerm || selectedStatus !== 'all' || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter to find what you are looking for.'
                  : 'No project requests have been submitted yet.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Project Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Created By
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Target & Progress
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request, index) => {
                    const progress = request.calculatedProgress || calculateProgress(request);
                    const progressWidth = Math.max(2, progress); // Ensure minimum 2% width for visibility
                    
                    return (
                      <motion.tr
                        key={request._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-primary-50/30 transition-colors duration-150 group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                              <FaFolder className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900 group-hover:text-primary-700 transition-colors duration-200">
                                {request.title}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center mt-1">
                                <FaMapMarkerAlt className="h-3 w-3 mr-1 text-primary-400" />
                                {request.location}
                              </div>
                              <div className="flex items-center mt-1 space-x-2">
                                {getCategoryBadge(request.category)}
                                <div className="text-xs text-gray-500 flex items-center">
                                  <FaUsers className="h-3 w-3 mr-1 text-primary-400" />
                                  {request.beneficiaries}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {request.createdBy?.name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">{request.organization}</div>
                          <div className="text-xs text-primary-600 font-medium">
                            {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Unknown date'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">
                            {formatCurrency(request.targetAmount)}
                          </div>
                          {request.currentAmount && (
                            <div className="text-xs text-gray-600 mt-1">
                              Raised: {formatCurrency(request.currentAmount)}
                            </div>
                          )}
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                              className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${progressWidth}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {progress}% • {request.donors || 0} donors
                          </div>
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            <FaCalendar className="h-3 w-3 mr-1 text-primary-400" />
                            {request.deadline ? new Date(request.deadline).toLocaleDateString() : 'No deadline'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(request.isApproved)}
                          {request.rejectionReason && (
                            <div className="text-xs text-red-600 mt-1 max-w-xs truncate" title={request.rejectionReason}>
                              Reason: {request.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openDetails(request)}
                              className="inline-flex items-center p-2 border border-primary-300 text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                              title="View Details"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </motion.button>
                            
                            {request.isApproved === 'pending' && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleApprove(request._id)}
                                  disabled={actionLoading === request._id}
                                  className="inline-flex items-center p-2 border border-transparent text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Approve Project"
                                >
                                  <CheckCircleIcon className="h-4 w-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => openRejectModal(request)}
                                  disabled={actionLoading === request._id}
                                  className="inline-flex items-center p-2 border border-transparent text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-lg hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Reject Project"
                                >
                                  <XCircleIcon className="h-4 w-4" />
                                </motion.button>
                              </>
                            )}
                            
                            {request.isApproved === 'approved' && (
                              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                                Approved
                              </span>
                            )}
                            
                            {request.isApproved === 'rejected' && (
                              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
                                Rejected
                              </span>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Project Details Modal */}
        {showDetails && selectedRequest && (
          <ProjectDetailsModal
            project={selectedRequest}
            onClose={closeDetails}
            onEdit={() => {
              closeDetails();
            }}
          />
        )}

        {/* Reject Confirmation Modal */}
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Reject Project</h3>
                  <p className="text-sm text-gray-500">
                    Are you sure you want to reject this project?
                  </p>
                </div>
              </div>

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

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setProjectToAction(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  disabled={actionLoading === projectToAction?._id}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === projectToAction?._id ? 'Rejecting...' : 'Reject Project'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}