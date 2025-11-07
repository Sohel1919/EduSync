// client/src/components/beneficiaries/BeneficiaryStats.jsx
import { motion } from 'framer-motion';
import { StarIcon, HeartIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const BeneficiaryStats = ({ averageRating, totalReviews, totalProjects }) => {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
        <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl mx-auto mb-4">
          <StarSolid className="w-6 h-6 text-primary-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{averageRating}</h3>
        <p className="text-gray-600">Average Rating</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
        <div className="flex items-center justify-center w-12 h-12 bg-secondary-100 rounded-xl mx-auto mb-4">
          <HeartIcon className="w-6 h-6 text-secondary-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{totalReviews}</h3>
        <p className="text-gray-600">Total Reviews</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mx-auto mb-4">
          <TrophyIcon className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{totalProjects}</h3>
        <p className="text-gray-600">Projects Reviewed</p>
      </div>
    </motion.div>
  );
};

export default BeneficiaryStats;