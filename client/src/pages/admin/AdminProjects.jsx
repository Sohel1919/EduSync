import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { FaFolder, FaRupeeSign, FaChartBar, FaUsers, FaCalendar, FaMapMarkerAlt } from 'react-icons/fa';
import ProjectForm from './components/ProjectForm';
import ProjectDetailsModal from './components/ProjectDetailsModal';
import { projectsAPI } from '../../services/apiService';
import { showToast } from '../../utils/toast';

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'education', label: 'Education' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'empowerment', label: 'Empowerment' },
  { value: 'environment', label: 'Environment' },
  { value: 'disaster-relief', label: 'Disaster Relief' }
];

const statuses = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'draft', label: 'Draft' }
];

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  const projectsPerPage = 10;

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getAdminProjects();
      
      let projectsData = [];
      
      // Handle different possible response structures
      if (Array.isArray(response.data)) {
        projectsData = response.data;
      } else if (response.data && Array.isArray(response.data.projects)) {
        projectsData = response.data.projects;
      } else if (response.data && Array.isArray(response.data.data)) {
        projectsData = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        // If it's a single project object, wrap it in an array
        projectsData = [response.data];
      } else {
        projectsData = [];
      }
      
      console.log('Fetched projects:', projectsData);
      setProjects(projectsData);
      setFilteredProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
      if (error.response?.status === 404) {
        showToast.error('Projects endpoint not found. Please check API configuration.');
      } else {
        showToast.error('Failed to load projects');
      }
      setProjects([]);
      setFilteredProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Safe stats calculation
  const calculateStats = (projectsArray) => {
    if (!Array.isArray(projectsArray) || projectsArray.length === 0) {
      return {
        totalProjects: 0,
        totalTarget: 0,
        totalCollected: 0,
        totalBeneficiaries: 0
      };
    }

    const totalTarget = projectsArray.reduce((sum, project) => sum + (Number(project.targetAmount) || 0), 0);
    const totalCollected = projectsArray.reduce((sum, project) => sum + (Number(project.collectedAmount) || 0), 0);
    const totalBeneficiaries = projectsArray.reduce((sum, project) => sum + (Number(project.beneficiaries) || 0), 0);

    return {
      totalProjects: projectsArray.length,
      totalTarget,
      totalCollected,
      totalBeneficiaries
    };
  };

  const stats = calculateStats(projects);

  // Safe filter and search projects
  useEffect(() => {
    if (!Array.isArray(projects)) {
      setFilteredProjects([]);
      return;
    }

    let filtered = projects.filter(project => {
      if (!project || typeof project !== 'object') return false;

      const searchLower = searchTerm.toLowerCase();
      const title = String(project.title || '');
      const summary = String(project.summary || '');
      const organization = String(project.organization || '');
      
      const matchesSearch = 
        title.toLowerCase().includes(searchLower) ||
        summary.toLowerCase().includes(searchLower) ||
        organization.toLowerCase().includes(searchLower);
      
      const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort projects safely
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case 'highest-collected':
        filtered.sort((a, b) => (Number(b.collectedAmount) || 0) - (Number(a.collectedAmount) || 0));
        break;
      case 'deadline':
        filtered.sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0));
        break;
      default:
        break;
    }

    setFilteredProjects(filtered);
    setCurrentPage(1);
  }, [projects, searchTerm, selectedCategory, selectedStatus, sortBy]);

  // Pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  const handleCreateProject = () => {
    setSelectedProject(null);
    setShowForm(true);
  };

  const handleEditProject = async (projectData) => {
    try {
      if (selectedProject) {
        await projectsAPI.update(selectedProject._id, projectData);
        showToast.success('Project updated successfully!');
      } else {
        await projectsAPI.create(projectData);
        showToast.success('Project created successfully!');
      }
      fetchProjects();
      setShowForm(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error saving project:', error);
      // Error is handled in ProjectForm component
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await projectsAPI.delete(projectId);
      showToast.success('Project deleted successfully');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      showToast.error('Failed to delete project');
    }
  };

  const openEditForm = (project) => {
    setSelectedProject(project);
    setShowForm(true);
  };

  const openDetails = (project) => {
    setSelectedProject(project);
    setShowDetails(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedProject(null);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedProject(null);
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      draft: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.charAt(0)?.toUpperCase() + status?.slice(1) || 'Unknown'}
      </span>
    );
  };

  // Get category badge
  const getCategoryBadge = (category) => {
    const styles = {
      education: 'bg-blue-50 text-blue-700 border-blue-200',
      healthcare: 'bg-green-50 text-green-700 border-green-200',
      empowerment: 'bg-purple-50 text-purple-700 border-purple-200',
      environment: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'disaster-relief': 'bg-red-50 text-red-700 border-red-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[category] || 'bg-gray-50 text-gray-700'}`}>
        {category?.split('-')?.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Uncategorized'}
      </span>
    );
  };

  // Calculate progress
  const calculateProgress = (project) => {
    if (!project.targetAmount) return 0;
    const progress = ((project.collectedAmount || 0) / project.targetAmount) * 100;
    return Math.min(100, Math.max(0, Math.round(progress)));
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
              Projects Management
            </motion.h1>
            <motion.p 
              className="text-gray-600 mt-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Create and manage charity projects
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <button
              onClick={handleCreateProject}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 font-medium shadow-lg"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Project
            </button>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { 
              name: 'Total Projects', 
              value: stats.totalProjects, 
              icon: FaFolder, 
              color: 'from-primary-500 to-primary-600',
              bgColor: 'bg-primary-50'
            },
            { 
              name: 'Total Target', 
              value: `₹${(stats.totalTarget / 1000).toFixed(0)}K`, 
              icon: FaRupeeSign, 
              color: 'from-green-500 to-emerald-600',
              bgColor: 'bg-green-50'
            },
            { 
              name: 'Total Collected', 
              value: `₹${(stats.totalCollected / 1000).toFixed(0)}K`, 
              icon: FaChartBar, 
              color: 'from-purple-500 to-indigo-600',
              bgColor: 'bg-purple-50'
            },
            { 
              name: 'Beneficiaries', 
              value: stats.totalBeneficiaries.toLocaleString(), 
              icon: FaUsers, 
              color: 'from-amber-500 to-orange-600',
              bgColor: 'bg-amber-50'
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

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest-collected">Highest Collected</option>
              <option value="deadline">Deadline</option>
            </select>
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
              Projects ({filteredProjects.length})
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
          ) : currentProjects.length === 0 ? (
            <div className="text-center py-12">
              <FaFolder className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No projects found</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' 
                  ? 'Try adjusting your search or filter to find what you are looking for.'
                  : 'Get started by creating a new project.'
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
                      Organization & Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Target & Progress
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status & Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentProjects.map((project, index) => {
                    const progress = calculateProgress(project);
                    const progressWidth = Math.max(2, progress);
                    
                    return (
                      <motion.tr
                        key={project._id || project.id}
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
                                {project.title}
                              </div>
                              <div className="text-sm text-gray-500 mt-1 line-clamp-2 max-w-xs">
                                {project.summary}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center mt-1">
                                <FaCalendar className="h-3 w-3 mr-1 text-primary-400" />
                                Created: {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown date'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {project.organization}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <FaMapMarkerAlt className="h-3 w-3 mr-1 text-primary-400" />
                            {project.location}
                          </div>
                          <div className="text-xs text-primary-600 font-medium flex items-center mt-1">
                            <FaUsers className="h-3 w-3 mr-1" />
                            {project.beneficiaries} beneficiaries
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">
                            {formatCurrency(project.targetAmount)}
                          </div>
                          {project.collectedAmount && (
                            <div className="text-xs text-gray-600 mt-1">
                              Collected: {formatCurrency(project.collectedAmount)}
                            </div>
                          )}
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                              className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${progressWidth}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {progress}% Progress
                          </div>
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            <FaCalendar className="h-3 w-3 mr-1 text-primary-400" />
                            {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            {getStatusBadge(project.status)}
                            {getCategoryBadge(project.category)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openDetails(project)}
                              className="inline-flex items-center p-2 border border-primary-300 text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                              title="View Details"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openEditForm(project)}
                              className="inline-flex items-center p-2 border border-transparent text-white bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                              title="Edit Project"
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDeleteProject(project._id || project.id)}
                              className="inline-flex items-center p-2 border border-transparent text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-lg hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                              title="Delete Project"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstProject + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastProject, filteredProjects.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredProjects.length}</span> results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Project Form Modal */}
        {showForm && (
          <ProjectForm
            project={selectedProject}
            onSave={handleEditProject}
            onClose={closeForm}
            refreshProjects={fetchProjects}
          />
        )}

        {/* Project Details Modal */}
        {showDetails && selectedProject && (
          <ProjectDetailsModal
            project={selectedProject}
            onClose={closeDetails}
            onEdit={() => {
              closeDetails();
              openEditForm(selectedProject);
            }}
          />
        )}
      </div>
    </div>
  );
}