import { motion } from 'framer-motion';
import { FaEye, FaEdit, FaTrash, FaCalendar, FaMapMarkerAlt, FaUsers, FaRupeeSign, FaFolder } from 'react-icons/fa';

// Format number to Indian currency format
const formatIndianCurrency = (amount) => {
  if (!amount) return '₹0';
  const num = parseInt(amount);
  if (num >= 10000000) return '₹' + (num / 10000000).toFixed(1) + 'Cr';
  if (num >= 100000) return '₹' + (num / 100000).toFixed(1) + 'L';
  if (num >= 1000) return '₹' + (num / 1000).toFixed(1) + 'K';
  return '₹' + num;
};

const getStatusColor = (status) => {
  const colors = {
    active: 'bg-green-100 text-green-800 border-green-200',
    paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
    draft: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getCategoryColor = (category) => {
  const colors = {
    education: 'bg-blue-50 text-blue-700 border-blue-200',
    healthcare: 'bg-green-50 text-green-700 border-green-200',
    empowerment: 'bg-purple-50 text-purple-700 border-purple-200',
    environment: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'disaster-relief': 'bg-red-50 text-red-700 border-red-200',
    'animal-welfare': 'bg-orange-50 text-orange-700 border-orange-200',
    'elderly-care': 'bg-pink-50 text-pink-700 border-pink-200',
    'child-development': 'bg-cyan-50 text-cyan-700 border-cyan-200'
  };
  return colors[category] || 'bg-gray-50 text-gray-700 border-gray-200';
};

export default function ProjectCard({ project, index, onView, onEdit, onDelete }) {
  const progress = Math.round(((project.collectedAmount || 0) / (project.targetAmount || 1)) * 100);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group hover:border-primary-200"
    >
      <div className="flex items-start justify-between">
        {/* Left Section - Project Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start space-x-4 mb-4">
            <div className="flex-shrink-0 h-14 w-14 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <FaFolder className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-700 transition-colors duration-200 truncate">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                    {project.summary}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <FaMapMarkerAlt className="flex-shrink-0 mr-2 text-primary-400" />
              <span className="truncate">{project.location}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FaUsers className="flex-shrink-0 mr-2 text-primary-400" />
              <span>{project.beneficiaries} beneficiaries</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FaCalendar className="flex-shrink-0 mr-2 text-primary-400" />
              <span>{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FaRupeeSign className="flex-shrink-0 mr-2 text-primary-400" />
              <span>{formatIndianCurrency(project.targetAmount)}</span>
            </div>
          </div>

          {/* Progress and Status */}
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span className="font-medium">Progress</span>
                <span className="font-semibold text-primary-600">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                {project.status?.charAt(0).toUpperCase() + project.status?.slice(1) || 'Unknown'}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(project.category)}`}>
                {project.category?.split('-')?.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Uncategorized'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="ml-6 flex flex-col space-y-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onView(project)}
            className="inline-flex items-center p-3 border border-primary-300 text-primary-700 bg-primary-50 rounded-xl hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
            title="View Details"
          >
            <FaEye className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(project)}
            className="inline-flex items-center p-3 border border-transparent text-white bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
            title="Edit Project"
          >
            <FaEdit className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(project._id || project.id)}
            className="inline-flex items-center p-3 border border-transparent text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-xl hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
            title="Delete Project"
          >
            <FaTrash className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}