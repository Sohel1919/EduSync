import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ProjectCard, { dummyProjects } from '../../components/projects/ProjectCard';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const categories = [
  { id: 'all', name: 'All Projects' },
  { id: 'education', name: 'Education' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'women-empowerment', name: 'Women Empowerment' },
  { id: 'environment', name: 'Environment' },
  { id: 'animal-welfare', name: 'Animal Welfare' }
];

const ITEMS_PER_PAGE = 12;

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();

  // Calculate pagination values
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProjects = filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    const fetchProjects = () => {
      setLoading(true);
      
      setTimeout(() => {
        let filtered = [...dummyProjects];
        
        // Filter by category
        if (selectedCategory !== 'all') {
          filtered = filtered.filter(
            project => project.category === selectedCategory
          );
        }
        
        // Filter by search term
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter(
            project => 
              project.title.toLowerCase().includes(term) ||
              project.summary.toLowerCase().includes(term) ||
              project.tags.some(tag => tag.toLowerCase().includes(term))
          );
        }
        
        // Sort projects
        switch (sortBy) {
          case 'popular':
            filtered.sort((a, b) => b.collectedAmount - a.collectedAmount);
            break;
          case 'urgent':
            filtered.sort((a, b) => {
              const daysLeftA = Math.ceil((new Date(a.deadline) - new Date()) / (1000 * 60 * 60 * 24));
              const daysLeftB = Math.ceil((new Date(b.deadline) - new Date()) / (1000 * 60 * 60 * 24));
              return daysLeftA - daysLeftB;
            });
            break;
          case 'almost-funded':
            filtered.sort((a, b) => {
              const progressA = (a.collectedAmount / a.targetAmount) * 100;
              const progressB = (b.collectedAmount / b.targetAmount) * 100;
              return progressB - progressA;
            });
            break;
          case 'newest':
          default:
            filtered.sort((a, b) => b.id - a.id);
            break;
        }
        
        setFilteredProjects(filtered);
        setProjects(filtered);
        setLoading(false);
      }, 800);
    };

    fetchProjects();
  }, [selectedCategory, searchTerm, sortBy]);

  // Reset search and pagination when category changes
  useEffect(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, [selectedCategory]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBeneficiaryApply = (projectId) => {
    navigate(`/projects/${projectId}/apply-beneficiary`);
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
          onClick={() => handlePageChange(i)}
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
      <div className="flex items-center justify-center space-x-2 mt-12">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
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
              onClick={() => handlePageChange(totalPages)}
              className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Projects</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover meaningful causes and make a difference through your support. 
            Every contribution helps us create lasting change.
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
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

            {/* Search and View Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* View Mode and Sort */}
              <div className="flex items-center gap-3">
                {/* View Mode */}
                <div className="flex border border-gray-300 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Squares2X2Icon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <ListBulletIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="urgent">Urgent Need</option>
                  <option value="almost-funded">Almost Funded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filters Info */}
          {(selectedCategory !== 'all' || searchTerm) && (
            <motion.div 
              className="mt-4 flex items-center gap-2 text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
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
            </motion.div>
          )}
        </motion.div>

        {/* Projects Count and Pagination Info */}
        {!loading && (
          <motion.div 
            className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-gray-600">
              Showing {Math.min(startIndex + 1, filteredProjects.length)}-
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredProjects.length)} of {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
              {selectedCategory !== 'all' && (
                <span> in <strong>{categories.find(cat => cat.id === selectedCategory)?.name}</strong></span>
              )}
            </div>
            
            {totalPages > 1 && (
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </motion.div>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div className={`grid gap-8 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-2 bg-gray-200 rounded-full"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <motion.div 
              className={`grid gap-8 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {currentProjects.map((project, index) => (
                <ProjectCard 
                  key={project.id} 
                  project={project}
                  onBeneficiaryApply={handleBeneficiaryApply}
                />
              ))}
            </motion.div>

            {/* Pagination */}
            {renderPagination()}
          </>
        )}

        {/* Empty State */}
        {!loading && filteredProjects.length === 0 && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-gray-300 text-8xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No projects found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {searchTerm 
                ? `No projects match your search for "${searchTerm}". Try different keywords or browse all categories.`
                : `No projects available in this category at the moment. Check back soon for new initiatives.`
              }
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchTerm('');
                }}
                className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
              >
                Browse All Projects
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}