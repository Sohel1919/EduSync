// client/src/components/beneficiaries/EmptyReviewsState.jsx
import { motion } from 'framer-motion';

const EmptyReviewsState = ({ selectedProject, onClearFilter }) => {
  return (
    <motion.div 
      className="text-center py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="text-gray-300 text-8xl mb-6">💬</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">No reviews found</h3>
      <p className="text-gray-600 max-w-md mx-auto mb-6">
        {selectedProject !== 'all' 
          ? `No reviews available for "${selectedProject}". Try selecting a different project.`
          : `No reviews available at the moment. Check back soon for new beneficiary stories.`
        }
      </p>
      {selectedProject !== 'all' && (
        <button
          onClick={onClearFilter}
          className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
        >
          View All Reviews
        </button>
      )}
    </motion.div>
  );
};

export default EmptyReviewsState;