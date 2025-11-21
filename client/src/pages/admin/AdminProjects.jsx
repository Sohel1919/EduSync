import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { FaFolder, FaRupeeSign, FaChartBar, FaUsers } from 'react-icons/fa';
import ProjectCard from './components/ProjectCard';
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects Management</h1>
            <p className="text-gray-600 mt-2">Create and manage charity projects</p>
          </div>
          <button
            onClick={handleCreateProject}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Project
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { 
              name: 'Total Projects', 
              value: stats.totalProjects, 
              icon: FaFolder, 
              color: 'bg-blue-500'
            },
            { 
              name: 'Total Target', 
              value: `₹${(stats.totalTarget / 1000).toFixed(0)}K`, 
              icon: FaRupeeSign, 
              color: 'bg-green-500'
            },
            { 
              name: 'Total Collected', 
              value: `₹${(stats.totalCollected / 1000).toFixed(0)}K`, 
              icon: FaChartBar, 
              color: 'bg-purple-500'
            },
            { 
              name: 'Beneficiaries', 
              value: stats.totalBeneficiaries.toLocaleString(), 
              icon: FaUsers, 
              color: 'bg-amber-500'
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd className="text-lg font-semibold text-gray-900">{stat.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
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
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
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
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest-collected">Highest Collected</option>
              <option value="deadline">Deadline</option>
            </select>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Projects ({filteredProjects.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-4">
                    <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : currentProjects.length === 0 ? (
            <div className="text-center py-12">
              <FaFolder className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' 
                  ? 'Try adjusting your search or filter to find what you are looking for.'
                  : 'Get started by creating a new project.'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {currentProjects.map((project, index) => (
                  <ProjectCard
                    key={project._id || project.id}
                    project={project}
                    index={index}
                    onView={openDetails}
                    onEdit={openEditForm}
                    onDelete={handleDeleteProject}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
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
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg ${
                            currentPage === page
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

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