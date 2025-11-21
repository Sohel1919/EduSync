import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  PencilSquareIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

export default function ProjectDetailsModal({ project, onClose, onEdit }) {
  const progress = Math.round((project.collectedAmount / project.targetAmount) * 100);
  
  const getCategoryColor = (category) => {
    const colors = {
      education: 'bg-blue-100 text-blue-800',
      healthcare: 'bg-green-100 text-green-800',
      empowerment: 'bg-purple-100 text-purple-800',
      environment: 'bg-emerald-100 text-emerald-800',
      'disaster-relief': 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      draft: 'bg-yellow-100 text-yellow-800',
      paused: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Project Details</h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={onEdit}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PencilSquareIcon className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Hero Image */}
            {project.images && project.images.length > 0 && (
              <div className="h-64 bg-gray-200 overflow-hidden">
                <img
                  src={project.images[0]}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6 space-y-6">
              {/* Title and Meta */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(project.category)}`}>
                      {project.category}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                </div>
                <p className="text-lg text-gray-600">{project.summary}</p>
              </div>

              {/* Progress */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      ${(project.collectedAmount / 1000).toFixed(0)}K
                    </div>
                    <div className="text-gray-600">
                      raised of ${(project.targetAmount / 1000).toFixed(0)}K goal
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">{progress}%</div>
                    <div className="text-gray-600">Progress</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-secondary-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Project Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <BuildingOfficeIcon className="h-5 w-5 mr-3" />
                    <span className="font-medium">Organization:</span>
                    <span className="ml-2">{project.organization}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="h-5 w-5 mr-3" />
                    <span className="font-medium">Location:</span>
                    <span className="ml-2">{project.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <UsersIcon className="h-5 w-5 mr-3" />
                    <span className="font-medium">Beneficiaries:</span>
                    <span className="ml-2">{project.beneficiaries}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-5 w-5 mr-3" />
                    <span className="font-medium">Created:</span>
                    <span className="ml-2">{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-5 w-5 mr-3" />
                    <span className="font-medium">Deadline:</span>
                    <span className="ml-2">{new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <CurrencyDollarIcon className="h-5 w-5 mr-3" />
                    <span className="font-medium">Remaining:</span>
                    <span className="ml-2">${((project.targetAmount - project.collectedAmount) / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Description</h3>
                <p className="text-gray-600 leading-relaxed">{project.description}</p>
              </div>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Images */}
              {project.images && project.images.length > 1 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {project.images.slice(1).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${project.title} ${index + 2}`}
                        className="w-full h-32 object-cover rounded-lg shadow-sm"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Project Updates */}
              {project.updates && project.updates.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Updates</h3>
                  <div className="space-y-4">
                    {project.updates.map((update, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-3 h-3 bg-primary-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-gray-900">{update.text}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(update.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}