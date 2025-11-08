import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import ProjectDetailsModal from './components/ProjectDetailsModal';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';

const categories = [
  { id: 'all', name: 'All Projects' },
  { id: 'education', name: 'Education' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'women-empowerment', name: 'Women Empowerment' },
  { id: 'environment', name: 'Environment' },
  { id: 'animal-welfare', name: 'Animal Welfare' }
];

const ITEMS_PER_PAGE = 10;

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const api = useApi();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Calculate pagination values
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProjects = filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, selectedCategory]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual API
      setTimeout(() => {
        const demoProjects = [
          {
            id: 1,
            title: "Education for Underprivileged Children",
            summary: "Providing quality education, books, and school supplies to children from low-income families in rural areas.",
            description: "This project aims to bridge the educational gap by providing comprehensive support including tuition, study materials, and digital literacy programs to underprivileged children in rural Maharashtra.",
            category: "education",
            targetAmount: 500000,
            collectedAmount: 325000,
            deadline: "2024-12-31",
            images: ["https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"],
            tags: ["education", "children", "rural", "school"],
            beneficiaries: 250,
            organization: "Education for All Foundation",
            location: "Rural Maharashtra",
            status: "active",
            createdBy: "admin@caresync.org",
            createdAt: "2024-01-15",
            updates: [
              {
                date: "2024-02-01",
                title: "Project Launch",
                description: "Successfully launched the project with initial funding"
              }
            ]
          },
          {
            id: 2,
            title: "Healthcare for Rural Communities",
            summary: "Setting up mobile medical clinics and providing free healthcare services to remote villages.",
            description: "Mobile medical units will travel to remote villages providing basic healthcare services, medicines, and health awareness programs.",
            category: "healthcare",
            targetAmount: 750000,
            collectedAmount: 450000,
            deadline: "2024-11-15",
            images: ["https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"],
            tags: ["healthcare", "medical", "rural", "clinic"],
            beneficiaries: 500,
            organization: "Rural Health Initiative",
            location: "Uttar Pradesh",
            status: "active",
            createdBy: "admin@caresync.org",
            createdAt: "2024-01-10",
            updates: []
          }
        ];
        setProjects(demoProjects);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(term) ||
        project.summary.toLowerCase().includes(term) ||
        project.organization.toLowerCase().includes(term) ||
        project.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    setFilteredProjects(filtered);
    setCurrentPage(1);
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  const handleEditProject = (projectId) => {
    navigate(`/admin/projects/edit/${projectId}`);
  };

  const handleDeleteProject = async (projectId) => {
    try {
      // In a real app, this would be an API call
      // await api.delete(`/admin/projects/${projectId}`);
      
      setProjects(projects.filter(project => project.id !== projectId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'education': return 'bg-blue-100 text-blue-800';
      case 'healthcare': return 'bg-green-100 text-green-800';
      case 'women-empowerment': return 'bg-purple-100 text-purple-800';
      case 'environment': return 'bg-teal-100 text-teal-800';
      case 'animal-welfare': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentPage === i
              ? 'bg-primary-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => setCurrentPage(1)}
              className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2 text-gray-500">...</span>}
          </>
        )}

        {pages}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2 text-gray-500">...</span>}
            <button
              onClick={() => setCurrentPage(totalPages)}
              className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
              <p className="mt-2 text-sm text-gray-700">
                Manage and monitor all projects in the system
              </p>
            </div>
            <motion.button
              onClick={() => navigate('/admin/projects/add')}
              className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Project
            </motion.button>
          </div>
        </div>

        {/* Filters and Search */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-64">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Active Filters Info */}
          {(selectedCategory !== 'all' || searchTerm) && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <FunnelIcon className="w-4 h-4" />
              <span>Active filters: </span>
              {selectedCategory !== 'all' && (
                <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
                  {categories.find(cat => cat.id === selectedCategory)?.name}
                </span>
              )}
              {searchTerm && (
                <span className="bg-secondary-100 text-secondary-800 px-2 py-1 rounded-full text-xs">
                  Search: "{searchTerm}"
                </span>
              )}
              <button 
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchTerm('');
                }}
                className="ml-2 text-primary-600 hover:text-primary-800 text-xs font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </motion.div>

        {/* Projects Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-4">
                    <div className="rounded-lg bg-gray-200 h-12 w-12"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentProjects.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img
                                className="h-10 w-10 rounded-lg object-cover"
                                src={project.images[0]}
                                alt={project.title}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {project.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {project.organization}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(project.category)}`}>
                            {project.category.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                              <div
                                className="bg-primary-600 h-2 rounded-full"
                                style={{
                                  width: `${Math.min((project.collectedAmount / project.targetAmount) * 100, 100)}%`
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">
                              {Math.round((project.collectedAmount / project.targetAmount) * 100)}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ₹{project.collectedAmount.toLocaleString()} / ₹{project.targetAmount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleViewProject(project)}
                              className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded-lg hover:bg-blue-50"
                              title="View Details"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEditProject(project.id)}
                              className="text-green-600 hover:text-green-900 transition-colors p-1 rounded-lg hover:bg-green-50"
                              title="Edit Project"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(project.id)}
                              className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-lg hover:bg-red-50"
                              title="Delete Project"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {filteredProjects.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-300 text-6xl mb-4">📁</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || selectedCategory !== 'all' 
                      ? 'Try adjusting your search or filters to find what you are looking for.'
                      : 'Get started by creating your first project.'
                    }
                  </p>
                  {(searchTerm || selectedCategory !== 'all') ? (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                      }}
                      className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/admin/projects/add')}
                      className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                    >
                      <PlusIcon className="h-5 w-5 inline mr-2" />
                      Add Project
                    </button>
                  )}
                </div>
              )}

              {/* Pagination */}
              {renderPagination()}
            </>
          )}
        </div>
      </div>

      {/* Project Details Modal */}
      {showDetailsModal && selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedProject(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <TrashIcon className="mx-auto h-12 w-12 text-red-600" />
              <h3 className="text-lg font-medium text-gray-900 mt-2">Delete Project</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this project? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProject(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}