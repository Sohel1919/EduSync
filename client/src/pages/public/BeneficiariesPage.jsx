// client/src/pages/public/BeneficiariesPage.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ReviewCard, { dummyReviews } from '../../components/beneficiaries/ReviewCard';
import BeneficiaryStats from '../../components/beneficiaries/BeneficiaryStats';
import WordCloudSection from '../../components/beneficiaries/WordCloudSection';
import TopProjectsSection from '../../components/beneficiaries/TopProjectsSection';
import ReviewsLoadingSkeleton from '../../components/beneficiaries/ReviewsLoadingSkeleton';
import EmptyReviewsState from '../../components/beneficiaries/EmptyReviewsState';
import { 
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 12;

export default function BeneficiariesPage() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('all');
  const navigate = useNavigate();

  // Calculate pagination values
  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentReviews = filteredReviews.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Get unique projects for filter
  const projects = [...new Set(dummyReviews.map(review => review.projectName))];

  // Calculate average rating and stats
  const averageRating = filteredReviews.length > 0 
    ? (filteredReviews.reduce((sum, review) => sum + review.rating, 0) / filteredReviews.length).toFixed(1)
    : 0;

  useEffect(() => {
    const fetchReviews = () => {
      setLoading(true);
      
      setTimeout(() => {
        let filtered = [...dummyReviews];
        
        // Filter by project
        if (selectedProject !== 'all') {
          filtered = filtered.filter(review => review.projectName === selectedProject);
        }
        
        setFilteredReviews(filtered);
        setReviews(filtered);
        setLoading(false);
      }, 800);
    };

    fetchReviews();
  }, [selectedProject]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProject]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Beneficiary Stories</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Read inspiring stories from people whose lives have been transformed through CareSync projects. 
            Every review represents a life changed.
          </p>
        </motion.div>

        {/* Stats Summary */}
        <BeneficiaryStats 
          averageRating={averageRating}
          totalReviews={filteredReviews.length}
          totalProjects={projects.length}
        />

        {/* Interactive Word Cloud */}
        <WordCloudSection />

        {/* Top Impactful Projects */}
        <TopProjectsSection filteredReviews={filteredReviews} />

        {/* Filters */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Filter by Project:</span>
            </div>
            
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none w-full sm:w-64"
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
          </div>

          {/* Active Filter Info */}
          {selectedProject !== 'all' && (
            <motion.div 
              className="mt-4 flex items-center gap-2 text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span>Showing reviews for:</span>
              <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full font-medium">
                {selectedProject}
              </span>
              <button 
                onClick={() => setSelectedProject('all')}
                className="ml-2 text-primary-600 hover:text-primary-800 text-sm font-medium"
              >
                Clear filter
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Reviews Count */}
        {!loading && (
          <motion.div 
            className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-gray-600">
              Showing {Math.min(startIndex + 1, filteredReviews.length)}-
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredReviews.length)} of {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''}
              {selectedProject !== 'all' && (
                <span> for <strong>{selectedProject}</strong></span>
              )}
            </div>
            
            {totalPages > 1 && (
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </motion.div>
        )}

        {/* Reviews Grid */}
        {loading ? (
          <ReviewsLoadingSkeleton />
        ) : (
          <>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {currentReviews.map((review, index) => (
                <ReviewCard 
                  key={review.id} 
                  review={review}
                  index={index}
                />
              ))}
            </motion.div>

            {/* Pagination */}
            {renderPagination()}
          </>
        )}

        {/* Empty State */}
        {!loading && filteredReviews.length === 0 && (
          <EmptyReviewsState 
            selectedProject={selectedProject}
            onClearFilter={() => setSelectedProject('all')}
          />
        )}
      </div>
    </div>
  );
}