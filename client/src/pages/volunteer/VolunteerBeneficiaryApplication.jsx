import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { 
  FaUsers, 
  FaRupeeSign, 
  FaCalendar, 
  FaMapMarkerAlt,
  FaIdCard,
  FaHome,
  FaFileMedical,
  FaHeart,
  FaProjectDiagram
} from 'react-icons/fa';
import { beneficiariesAPI } from '../../services/apiService';
import { showToast } from '../../utils/toast';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'under-review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'on-hold', label: 'On Hold' }
];

export default function VolunteerBeneficiaryApplication() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [applicationToAction, setApplicationToAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [projects, setProjects] = useState([]);

  // Fetch beneficiary applications for volunteer's projects
  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      const filters = {};
      if (selectedStatus !== 'all') filters.status = selectedStatus;
      if (selectedProject !== 'all') filters.projectId = selectedProject;
      if (searchTerm) filters.search = searchTerm;

      const response = await beneficiariesAPI.getVolunteerApplications(filters);
      
      let applicationsData = [];
      let volunteerProjects = [];
      
      if (Array.isArray(response.data)) {
        applicationsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        applicationsData = response.data.data;
      } else {
        applicationsData = [];
      }

      // Get projects from response
      if (response.data && response.data.projects) {
        volunteerProjects = response.data.projects;
      }
      
      console.log('Fetched volunteer beneficiary applications:', applicationsData);
      console.log('Volunteer projects:', volunteerProjects);
      
      setApplications(applicationsData);
      setFilteredApplications(applicationsData);
      
      // Set projects for filter
      setProjects([
        { value: 'all', label: 'All Projects' }, 
        ...volunteerProjects.map(project => ({ 
          value: project._id, 
          label: project.title 
        }))
      ]);
      
    } catch (error) {
      console.error('Error fetching volunteer beneficiary applications:', error);
      showToast.error('Failed to load beneficiary applications');
      setApplications([]);
      setFilteredApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Handle filter changes
  useEffect(() => {
    fetchApplications();
  }, [selectedStatus, selectedProject]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm || selectedStatus !== 'all' || selectedProject !== 'all') {
        fetchApplications();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Helper function to safely get project title
  const getProjectTitle = (application) => {
    if (application.projectTitle) {
      return application.projectTitle;
    }
    if (typeof application.projectId === 'object' && application.projectId !== null) {
      return application.projectId.title || application.projectId._id;
    }
    return application.projectId || 'Unknown Project';
  };

  // Helper function to safely get project ID
  const getProjectId = (application) => {
    if (typeof application.projectId === 'object' && application.projectId !== null) {
      return application.projectId._id;
    }
    return application.projectId || 'Unknown ID';
  };

  // Handle approve application
  const handleApprove = async (applicationId) => {
    try {
      setActionLoading(applicationId);
      
      const response = await beneficiariesAPI.updateStatus(applicationId, { 
        status: 'approved'
      });
      
      if (response.data && response.data.success) {
        setApplications(prev => 
          prev.map(app => 
            app._id === applicationId 
              ? { ...app, status: 'approved' }
              : app
          )
        );
        
        showToast.success('Application approved successfully!');
      } else {
        throw new Error(response.data?.message || 'Failed to approve application');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      showToast.error(error.response?.data?.message || error.message || 'Failed to approve application');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle reject application
  const handleReject = async (applicationId, reason = '') => {
    try {
      setActionLoading(applicationId);
      
      const response = await beneficiariesAPI.updateStatus(applicationId, { 
        status: 'rejected',
        reviewNotes: reason
      });
      
      if (response.data && response.data.success) {
        setApplications(prev => 
          prev.map(app => 
            app._id === applicationId 
              ? { 
                  ...app, 
                  status: 'rejected',
                  reviewNotes: reason 
                }
              : app
          )
        );
        
        showToast.success('Application rejected successfully!');
      } else {
        throw new Error(response.data?.message || 'Failed to reject application');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      showToast.error(error.response?.data?.message || error.message || 'Failed to reject application');
    } finally {
      setActionLoading(null);
      setShowRejectModal(false);
      setRejectionReason('');
      setApplicationToAction(null);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (applicationId, status, notes = '') => {
    try {
      setActionLoading(applicationId);
      
      const response = await beneficiariesAPI.updateStatus(applicationId, { 
        status,
        reviewNotes: notes
      });
      
      if (response.data && response.data.success) {
        setApplications(prev => 
          prev.map(app => 
            app._id === applicationId 
              ? { 
                  ...app, 
                  status: status,
                  reviewNotes: notes 
                }
              : app
          )
        );
        
        showToast.success(`Application ${status} successfully!`);
      } else {
        throw new Error(response.data?.message || 'Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      showToast.error(error.response?.data?.message || error.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  // Open reject confirmation modal
  const openRejectModal = (application) => {
    setApplicationToAction(application);
    setShowRejectModal(true);
  };

  // Confirm rejection with reason
  const confirmReject = () => {
    if (applicationToAction) {
      handleReject(applicationToAction._id, rejectionReason);
    }
  };

  const openDetails = (application) => {
    setSelectedApplication(application);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedApplication(null);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'under-review': 'bg-blue-100 text-blue-800 border-blue-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      'on-hold': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    
    const statusLabels = {
      pending: 'Pending',
      'under-review': 'Under Review',
      approved: 'Approved',
      rejected: 'Rejected',
      'on-hold': 'On Hold'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[status] || 'Unknown'}
      </span>
    );
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Stats calculation
  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
    underReview: applications.filter(app => app.status === 'under-review').length,
    onHold: applications.filter(app => app.status === 'on-hold').length
  };

  // Application Details Modal Component
  const ApplicationDetailsModal = ({ application, onClose }) => {
    if (!application) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-4 rounded-t-xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Beneficiary Application Details</h2>
                <p className="text-primary-100 text-sm">
                  Application ID: {application._id}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors duration-200"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Project Information */}
            <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
              <h3 className="text-lg font-semibold text-primary-800 mb-3 flex items-center">
                <FaProjectDiagram className="h-5 w-5 mr-2" />
                Project Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-primary-700">Project Title</label>
                  <p className="text-gray-900 font-semibold">{getProjectTitle(application)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary-700">Project ID</label>
                  <p className="text-gray-900">{getProjectId(application)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary-700">Application Date</label>
                  <p className="text-gray-900">{formatDate(application.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary-700">Current Status</label>
                  <div className="mt-1">{getStatusBadge(application.status)}</div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-gray-900 font-semibold">
                    {application.personalInfo?.firstName} {application.personalInfo?.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Date of Birth / Age</label>
                  <p className="text-gray-900">
                    {formatDate(application.personalInfo?.dateOfBirth)} 
                    ({calculateAge(application.personalInfo?.dateOfBirth)} years)
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Gender</label>
                  <p className="text-gray-900">{application.personalInfo?.gender}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Marital Status</label>
                  <p className="text-gray-900">{application.personalInfo?.maritalStatus}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">ID Type</label>
                  <p className="text-gray-900">{application.personalInfo?.idType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">ID Number</label>
                  <p className="text-gray-900">{application.personalInfo?.idNumber}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900 flex items-center">
                    <EnvelopeIcon className="h-4 w-4 mr-1 text-primary-500" />
                    {application.contactInfo?.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900 flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-1 text-primary-500" />
                    {application.contactInfo?.phone}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <p className="text-gray-900 flex items-start">
                    <MapPinIcon className="h-4 w-4 mr-1 text-primary-500 mt-0.5" />
                    {application.contactInfo?.address?.street}, {application.contactInfo?.address?.city},<br />
                    {application.contactInfo?.address?.state} - {application.contactInfo?.address?.pincode},<br />
                    {application.contactInfo?.address?.country}
                  </p>
                </div>
              </div>
            </div>

            {/* Family Background */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FaUsers className="h-5 w-5 mr-2" />
                Family Background
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Family Size</label>
                  <p className="text-gray-900">{application.familyBackground?.familySize} members</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Dependents</label>
                  <p className="text-gray-900">{application.familyBackground?.numberOfDependents} people</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Monthly Income</label>
                  <p className="text-gray-900 font-semibold">
                    {formatCurrency(application.familyBackground?.monthlyIncome)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Income Source</label>
                  <p className="text-gray-900">{application.familyBackground?.incomeSource}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Housing Type</label>
                  <p className="text-gray-900">{application.familyBackground?.housingType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Disability</label>
                  <p className="text-gray-900">
                    {application.familyBackground?.hasDisability ? 'Yes' : 'No'}
                    {application.familyBackground?.hasDisability && ` - ${application.familyBackground?.disabilityType}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Additional Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Personal Story & Challenges</label>
                  <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">
                    {application.additionalInfo?.story}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">How Project Will Help</label>
                  <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">
                    {application.additionalInfo?.howProjectWillHelp}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Expected Support</label>
                  <p className="text-gray-900 font-semibold">
                    {formatCurrency(application.applicationDetails?.expectedSupport)}
                  </p>
                </div>
              </div>
            </div>

            {/* Review Notes */}
            {application.reviewNotes && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Review Notes</h3>
                <p className="text-yellow-700">{application.reviewNotes}</p>
                {application.reviewedAt && (
                  <p className="text-yellow-600 text-sm mt-2">
                    Reviewed on: {formatDate(application.reviewedAt)}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {(application.status === 'pending' || application.status === 'under-review' || application.status === 'on-hold') && (
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                {application.status !== 'on-hold' && (
                  <button
                    onClick={() => handleStatusUpdate(application._id, 'on-hold', 'Application put on hold for further verification')}
                    disabled={actionLoading === application._id}
                    className="px-4 py-2 border border-orange-300 text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 disabled:opacity-50"
                  >
                    {actionLoading === application._id ? 'Processing...' : 'Put on Hold'}
                  </button>
                )}
                <button
                  onClick={() => openRejectModal(application)}
                  disabled={actionLoading === application._id}
                  className="px-4 py-2 border border-red-300 text-red-700 bg-red-50 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(application._id)}
                  disabled={actionLoading === application._id}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50"
                >
                  {actionLoading === application._id ? 'Approving...' : 'Approve'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
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
              My Project Applications
            </motion.h1>
            <motion.p 
              className="text-gray-600 mt-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Review and manage beneficiary applications for your projects
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center space-x-2 text-primary-600 bg-primary-50 px-4 py-2 rounded-lg border border-primary-200"
          >
            <FaProjectDiagram className="h-5 w-5" />
            <span className="font-semibold">{stats.total} Applications</span>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {[
            { 
              name: 'Total Applications', 
              value: stats.total, 
              icon: DocumentTextIcon, 
              color: 'from-primary-500 to-primary-600',
              bgColor: 'bg-primary-50'
            },
            { 
              name: 'Pending', 
              value: stats.pending, 
              icon: ClockIcon, 
              color: 'from-yellow-500 to-amber-600',
              bgColor: 'bg-yellow-50'
            },
            { 
              name: 'Under Review', 
              value: stats.underReview, 
              icon: EyeIcon, 
              color: 'from-blue-500 to-cyan-600',
              bgColor: 'bg-blue-50'
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
                placeholder="Search applicants..."
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

            {/* Project Filter */}
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
            >
              {projects.map(project => (
                <option key={project.value} value={project.value}>
                  {project.label}
                </option>
              ))}
            </select>

            {/* Reset Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
                setSelectedProject('all');
                fetchApplications();
              }}
              className="px-4 py-2 border border-primary-300 text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 font-medium"
            >
              Reset Filters
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
              <FaProjectDiagram className="h-5 w-5 mr-2 text-primary-600" />
              Applications for Your Projects ({filteredApplications.length})
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
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No applications found</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                {searchTerm || selectedStatus !== 'all' || selectedProject !== 'all' 
                  ? 'Try adjusting your search or filter to find what you are looking for.'
                  : 'No beneficiary applications have been submitted to your projects yet.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Applicant Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Project Information
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Family & Income
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status & Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((application, index) => (
                    <motion.tr
                      key={application._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-primary-50/30 transition-colors duration-150 group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                            <UserIcon className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-primary-700 transition-colors duration-200">
                              {application.personalInfo?.firstName} {application.personalInfo?.lastName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <EnvelopeIcon className="h-3 w-3 mr-1 text-primary-400" />
                              {application.contactInfo?.email}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <PhoneIcon className="h-3 w-3 mr-1 text-primary-400" />
                              {application.contactInfo?.phone}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Age: {calculateAge(application.personalInfo?.dateOfBirth)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {getProjectTitle(application)}
                        </div>
                        <div className="text-sm text-gray-500">{getProjectId(application)}</div>
                        <div className="text-xs text-primary-600 font-medium">
                          Applied: {formatDate(application.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <FaUsers className="h-3 w-3 mr-1 text-primary-400" />
                            Family: {application.familyBackground?.familySize}
                          </div>
                          <div className="flex items-center mt-1">
                            <FaRupeeSign className="h-3 w-3 mr-1 text-primary-400" />
                            Income: {formatCurrency(application.familyBackground?.monthlyIncome)}
                          </div>
                          <div className="flex items-center mt-1">
                            <FaHome className="h-3 w-3 mr-1 text-primary-400" />
                            {application.familyBackground?.housingType}
                          </div>
                          {application.familyBackground?.hasDisability && (
                            <div className="flex items-center mt-1 text-red-600">
                              <FaFileMedical className="h-3 w-3 mr-1" />
                              Has Disability
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="mb-2">{getStatusBadge(application.status)}</div>
                        <div className="text-xs text-gray-500">
                          Created: {formatDate(application.createdAt)}
                        </div>
                        {application.updatedAt && application.updatedAt !== application.createdAt && (
                          <div className="text-xs text-gray-500">
                            Updated: {formatDate(application.updatedAt)}
                          </div>
                        )}
                        {application.reviewedAt && (
                          <div className="text-xs text-green-600 font-medium">
                            Reviewed: {formatDate(application.reviewedAt)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openDetails(application)}
                            className="inline-flex items-center p-2 border border-primary-300 text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </motion.button>
                          
                          {application.status === 'pending' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleStatusUpdate(application._id, 'under-review')}
                                disabled={actionLoading === application._id}
                                className="inline-flex items-center p-2 border border-blue-300 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50"
                                title="Mark Under Review"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleApprove(application._id)}
                                disabled={actionLoading === application._id}
                                className="inline-flex items-center p-2 border border-transparent text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50"
                                title="Approve Application"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openRejectModal(application)}
                                disabled={actionLoading === application._id}
                                className="inline-flex items-center p-2 border border-transparent text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-lg hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50"
                                title="Reject Application"
                              >
                                <XCircleIcon className="h-4 w-4" />
                              </motion.button>
                            </>
                          )}
                          
                          {application.status === 'under-review' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleApprove(application._id)}
                                disabled={actionLoading === application._id}
                                className="inline-flex items-center p-2 border border-transparent text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50"
                                title="Approve Application"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openRejectModal(application)}
                                disabled={actionLoading === application._id}
                                className="inline-flex items-center p-2 border border-transparent text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-lg hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50"
                                title="Reject Application"
                              >
                                <XCircleIcon className="h-4 w-4" />
                              </motion.button>
                            </>
                          )}
                          
                          {application.status === 'approved' && (
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                              Approved
                            </span>
                          )}
                          
                          {application.status === 'rejected' && (
                            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
                              Rejected
                            </span>
                          )}

                          {application.status === 'on-hold' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleApprove(application._id)}
                                disabled={actionLoading === application._id}
                                className="inline-flex items-center p-2 border border-transparent text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50"
                                title="Approve Application"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openRejectModal(application)}
                                disabled={actionLoading === application._id}
                                className="inline-flex items-center p-2 border border-transparent text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-lg hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50"
                                title="Reject Application"
                              >
                                <XCircleIcon className="h-4 w-4" />
                              </motion.button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Application Details Modal */}
        {showDetails && (
          <ApplicationDetailsModal
            application={selectedApplication}
            onClose={closeDetails}
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
                  <h3 className="text-lg font-semibold text-gray-900">Reject Application</h3>
                  <p className="text-sm text-gray-500">
                    Are you sure you want to reject this application?
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
                    setApplicationToAction(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  disabled={actionLoading === applicationToAction?._id}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === applicationToAction?._id ? 'Rejecting...' : 'Reject Application'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}