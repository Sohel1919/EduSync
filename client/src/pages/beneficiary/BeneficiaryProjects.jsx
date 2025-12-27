import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { beneficiariesAPI } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

// Updated StatsCard to match AdminDashboard
const StatsCard = ({ stat, index }) => (
  <motion.div
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
          <div className="flex items-center mt-1 text-sm font-semibold text-green-600">
            <ArrowTrendingUpIcon className="h-4 w-4" />
            <span className="ml-1">{stat.change}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
        </div>
        <div className={`p-3 rounded-xl ${stat.bgColor}`}>
          <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} text-white`}>
            <stat.icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const ProjectTable = ({ applications, loading, onViewDetails, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg p-4">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-500">No project applications found</p>
        <p className="text-sm text-gray-400 mt-1">Submit your first project application</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount Requested
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applied Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((application) => (
              <tr key={application._id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{application.projectTitle}</div>
                  <div className="text-sm text-gray-500">{application.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    application.status === 'approved' ? 'bg-green-100 text-green-800' :
                    application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{application.requestedAmount?.toLocaleString() || '0'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(application.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onViewDetails(application)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </motion.button>
                    {application.status === 'pending' && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEdit(application)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </motion.button>
                    )}
                    {application.status === 'pending' && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDelete(application)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </motion.button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ApplicationDetailsModal = ({ application, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{application.projectTitle}</h2>
              <div className="flex items-center mt-2">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  application.status === 'approved' ? 'bg-green-100 text-green-800' :
                  application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
                <span className="ml-4 text-sm text-gray-500">
                  Applied on {new Date(application.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Financial Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Requested Amount:</span>
                  <span className="font-semibold">₹{application.requestedAmount?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Approved Amount:</span>
                  <span className="font-semibold text-green-600">
                    {application.approvedAmount ? `₹${application.approvedAmount.toLocaleString()}` : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Disbursed Amount:</span>
                  <span className="font-semibold text-primary-600">
                    {application.disbursedAmount ? `₹${application.disbursedAmount.toLocaleString()}` : 'Not yet'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Project Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-semibold">{application.category || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold">{application.projectDuration || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Beneficiaries:</span>
                  <span className="font-semibold">{application.beneficiaryCount || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Project Description</h3>
              <p className="text-gray-600">{application.projectDescription || 'No description provided.'}</p>
            </div>

            {application.reviewNotes && (
              <div className="border-t pt-6">
                <h3 className="font-medium text-gray-900 mb-2">Review Notes</h3>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
                  <p className="text-gray-700">{application.reviewNotes}</p>
                </div>
              </div>
            )}

            {application.nextSteps && (
              <div className="border-t pt-6">
                <h3 className="font-medium text-gray-900 mb-2">Next Steps</h3>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-lg">
                  <p className="text-gray-700">{application.nextSteps}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function BeneficiaryProjects() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState([]);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  // Update fetchApplications function
const fetchApplications = async () => {
  try {
    setLoading(true);
    
    // Use the new endpoint with pagination and filtering
    const response = await beneficiariesAPI.getDashboardProjects({
      status: statusFilter,
      search: searchTerm,
      page: 1,
      limit: 10
    });
    
    if (response.data?.success) {
      const data = response.data.data;
      setApplications(data.applications);
      setFilteredApplications(data.applications);
      
      // Map stats with icons and colors
      const mappedStats = data.stats.map((stat, index) => {
        const icons = [DocumentTextIcon, CheckCircleIcon, ClockIcon, XCircleIcon];
        const colors = [
          'from-blue-500 to-blue-600',
          'from-green-500 to-emerald-600',
          'from-amber-500 to-amber-600',
          'from-red-500 to-red-600'
        ];
        const bgColors = ['bg-blue-50', 'bg-green-50', 'bg-amber-50', 'bg-red-50'];
        
        return {
          ...stat,
          icon: icons[index] || DocumentTextIcon,
          color: colors[index] || 'from-blue-500 to-blue-600',
          bgColor: bgColors[index] || 'bg-blue-50'
        };
      });
      
      setStats(mappedStats);
    }
  } catch (error) {
    console.error('Error fetching applications:', error);
  } finally {
    setLoading(false);
  }
};

  const filterApplications = () => {
    let filtered = [...applications];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.projectDescription?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleEdit = (application) => {
    // Navigate to edit page or show edit modal
    console.log('Edit application:', application);
  };

  const handleDelete = (application) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      // Delete application logic
      console.log('Delete application:', application);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header - Matches AdminDashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Project Applications</h1>
            <p className="mt-2 text-gray-600">Manage and track all your submitted applications</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors duration-200"
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            New Application
          </motion.button>
        </motion.div>

        {/* Stats Summary - Matches AdminDashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatsCard key={stat.name} stat={stat} index={index} />
          ))}
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchApplications}
                className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                Refresh
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Applications Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <ProjectTable
            applications={filteredApplications}
            loading={loading}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </motion.div>

        {/* Modal */}
        <ApplicationDetailsModal
          application={selectedApplication}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      </div>
    </div>
  );
}