import { motion } from 'framer-motion';
import { FaEye, FaEdit, FaTrash, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCalendar, FaUsers, FaClock } from 'react-icons/fa';

const getStatusColor = (status) => {
  const colors = {
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    suspended: 'bg-red-100 text-red-800 border-red-200'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getAvailabilityColor = (availability) => {
  const colors = {
    'full-time': 'bg-blue-100 text-blue-800 border-blue-200',
    'part-time': 'bg-purple-100 text-purple-800 border-purple-200',
    'weekends': 'bg-green-100 text-green-800 border-green-200',
    'evenings': 'bg-orange-100 text-orange-800 border-orange-200'
  };
  return colors[availability] || 'bg-gray-100 text-gray-800';
};

const formatSkills = (skills) => {
  if (!Array.isArray(skills)) return 'No skills';
  return skills.map(skill => skill.charAt(0).toUpperCase() + skill.slice(1)).join(', ');
};

export default function VolunteerCard({ volunteer, index, onView, onEdit, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group hover:border-primary-200"
    >
      <div className="flex items-start justify-between">
        {/* Left Section - Volunteer Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start space-x-4">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-200 border-2 border-primary-500 overflow-hidden">
                <img
                  src={volunteer.profileImage.url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'}
                  alt={volunteer.fullName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white"
                />
              </div>
            </div>

            {/* Volunteer Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-700 transition-colors duration-200 truncate">
                  {volunteer.fullName}
                </h3>
                <div className="flex items-center space-x-2 ml-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(volunteer.status)}`}>
                    {volunteer.status?.charAt(0).toUpperCase() + volunteer.status?.slice(1) || 'Unknown'}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getAvailabilityColor(volunteer.availability)}`}>
                    {volunteer.availability?.replace('-', ' ')?.toUpperCase() || 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="flex items-center text-sm text-gray-600">
                  <FaEnvelope className="flex-shrink-0 mr-2 text-primary-400" />
                  <span className="truncate">{volunteer.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FaPhone className="flex-shrink-0 mr-2 text-primary-400" />
                  <span>{volunteer.phone}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FaMapMarkerAlt className="flex-shrink-0 mr-2 text-primary-400" />
                  <span className="truncate">{volunteer.location}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FaCalendar className="flex-shrink-0 mr-2 text-primary-400" />
                  <span>Joined {new Date(volunteer.joinDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Skills and Stats */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Skills:</span> {formatSkills(volunteer.skills)}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <FaClock className="mr-1 text-primary-400" />
                      <span>{volunteer.hoursCompleted || 0} hours</span>
                    </div>
                    <div className="flex items-center">
                      <FaUsers className="mr-1 text-primary-400" />
                      <span>{volunteer.eventsAttended || 0} events</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="ml-4 flex flex-col space-y-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onView(volunteer)}
            className="inline-flex items-center p-2 border border-primary-300 text-primary-700 bg-primary-50 rounded-xl hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
            title="View Details"
          >
            <FaEye className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(volunteer)}
            className="inline-flex items-center p-2 border border-transparent text-white bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
            title="Edit Volunteer"
          >
            <FaEdit className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(volunteer._id || volunteer.id)}
            className="inline-flex items-center p-2 border border-transparent text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-xl hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
            title="Delete Volunteer"
          >
            <FaTrash className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}