import { motion } from 'framer-motion';
import { 
  XMarkIcon,
  CalendarIcon,
  UserGroupIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  TagIcon
} from '@heroicons/react/24/outline';

export default function ProjectDetailsModal({ project, onClose }) {
  const progress = (project.collectedAmount / project.targetAmount) * 100;
  const daysLeft = Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24));

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

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
            <p className="text-gray-600 mt-2">{project.summary}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Image */}
            <div className="rounded-lg overflow-hidden">
              <img
                src={project.images[0]}
                alt={project.title}
                className="w-full h-64 object-cover"
              />
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Description</h3>
              <p className="text-gray-700 leading-relaxed">{project.description}</p>
            </div>

            {/* Progress */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Funding Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Raised: ₹{project.collectedAmount.toLocaleString()}</span>
                  <span className="text-gray-600">Goal: ₹{project.targetAmount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-900">{Math.round(progress)}% funded</span>
                  <span className="text-gray-600 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Completed'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Category</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(project.category)}`}>
                    {project.category.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Beneficiaries</span>
                  <span className="text-sm text-gray-900 flex items-center">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    {project.beneficiaries}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Deadline</span>
                  <span className="text-sm text-gray-900">
                    {new Date(project.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Organization */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{project.organization}</span>
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{project.location}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TagIcon className="h-5 w-5 mr-2" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created By:</span>
                  <span className="text-gray-900">{project.createdBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created On:</span>
                  <span className="text-gray-900">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {project.updatedBy && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated By:</span>
                    <span className="text-gray-900">{project.updatedBy}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Project Updates */}
        {project.updates && project.updates.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Updates</h3>
            <div className="space-y-4">
              {project.updates.map((update, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{update.title}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(update.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{update.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}