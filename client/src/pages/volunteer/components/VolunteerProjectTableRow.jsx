import { motion } from 'framer-motion';
import { 
  EyeIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { UsersIcon } from '@heroicons/react/24/outline';

export default function VolunteerProjectTableRow({
  project,
  index,
  onViewProject,
  onEditProject,
  onDeleteProject,
  statusColors,
  priorityColors,
  getStatusIcon,
  formatDate,
  getDaysRemaining
}) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="hover:bg-gray-50 transition-colors duration-150"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
            {project.projectImage?.url ? (
              <img 
                src={project.projectImage.url} 
                alt={project.title}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <UsersIcon className="h-6 w-6 text-primary-600" />
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {project.title}
            </div>
            <div className="text-sm text-gray-500 line-clamp-1">
              {project.summary}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{project.organization}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-sm text-gray-500">
          <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
          {project.location}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {formatDate(project.deadline)}
        </div>
        <div className={`text-xs ${
          getDaysRemaining(project.deadline) < 7 ? 'text-red-500' : 'text-gray-500'
        }`}>
          {getDaysRemaining(project.deadline)} days remaining
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityColors[project.priority] || 'bg-gray-100 text-gray-800'}`}>
          {project.priority?.charAt(0).toUpperCase() + project.priority?.slice(1) || 'Normal'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[project.volunteerStatus] || 'bg-gray-100 text-gray-800'}`}>
          {getStatusIcon(project.volunteerStatus)}
          <span className="ml-1">
            {project.volunteerStatus?.charAt(0).toUpperCase() + project.volunteerStatus?.slice(1) || 'Unknown'}
          </span>
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewProject(project)}
            className="text-primary-600 hover:text-primary-900 transition-colors duration-200 p-1 rounded"
            title="View Details"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => onEditProject(project)}
            className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-1 rounded"
            title="Edit Project"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => onDeleteProject(project._id || project.id)}
            className="text-red-600 hover:text-red-900 transition-colors duration-200 p-1 rounded"
            title="Delete Project"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}