import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  PencilSquareIcon,
  CalendarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { FaUsers, FaCalendar, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

export default function VolunteerDetailsModal({ volunteer, onClose, onEdit }) {
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
    if (!Array.isArray(skills)) return [];
    return skills.map(skill => ({
      name: skill.charAt(0).toUpperCase() + skill.slice(1),
      color: 'bg-primary-50 text-primary-700 border-primary-200'
    }));
  };

  const skills = formatSkills(volunteer.skills);

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
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FaUsers className="h-6 w-6 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Volunteer Details</h2>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEdit}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-lg"
              >
                <PencilSquareIcon className="h-4 w-4 mr-2" />
                Edit Volunteer
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 hover:bg-white rounded-lg transition-all duration-200"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="p-6 space-y-6">
              {/* Profile Header */}
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    <img
                      src={volunteer.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'}
                      alt={volunteer.fullName}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{volunteer.fullName}</h1>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(volunteer.status)}`}>
                        {volunteer.status?.charAt(0).toUpperCase() + volunteer.status?.slice(1)}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getAvailabilityColor(volunteer.availability)}`}>
                        {volunteer.availability?.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  <p className="text-lg text-gray-600">{volunteer.bio || 'No bio available'}</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl p-4 text-center border border-primary-200">
                  <div className="text-2xl font-bold text-primary-600">{volunteer.hoursCompleted || 0}</div>
                  <div className="text-sm text-primary-600 font-medium">Hours Completed</div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl p-4 text-center border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{volunteer.eventsAttended || 0}</div>
                  <div className="text-sm text-green-600 font-medium">Events Attended</div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl p-4 text-center border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Date(volunteer.joinDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-purple-600 font-medium">Join Date</div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                  
                  <div className="flex items-center text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <EnvelopeIcon className="h-5 w-5 mr-3 text-primary-500" />
                    <div>
                      <div className="font-medium text-gray-900">Email</div>
                      <div className="text-sm">{volunteer.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <PhoneIcon className="h-5 w-5 mr-3 text-primary-500" />
                    <div>
                      <div className="font-medium text-gray-900">Phone</div>
                      <div className="text-sm">{volunteer.phone}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <MapPinIcon className="h-5 w-5 mr-3 text-primary-500" />
                    <div>
                      <div className="font-medium text-gray-900">Location</div>
                      <div className="text-sm">{volunteer.location}</div>
                    </div>
                  </div>

                  {volunteer.address && (
                    <div className="flex items-start text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <MapPinIcon className="h-5 w-5 mr-3 text-primary-500 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900">Address</div>
                        <div className="text-sm">{volunteer.address}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                  
                  {volunteer.dateOfBirth && (
                    <div className="flex items-center text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <CalendarIcon className="h-5 w-5 mr-3 text-primary-500" />
                      <div>
                        <div className="font-medium text-gray-900">Date of Birth</div>
                        <div className="text-sm">{new Date(volunteer.dateOfBirth).toLocaleDateString()}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <CalendarIcon className="h-5 w-5 mr-3 text-primary-500" />
                    <div>
                      <div className="font-medium text-gray-900">Member Since</div>
                      <div className="text-sm">{new Date(volunteer.joinDate).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {volunteer.emergencyContact && (
                    <div className="flex items-start text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <UserIcon className="h-5 w-5 mr-3 text-primary-500 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900">Emergency Contact</div>
                        <div className="text-sm">
                          {volunteer.emergencyContact.name} ({volunteer.emergencyContact.relation})
                        </div>
                        <div className="text-sm">{volunteer.emergencyContact.phone}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills */}
              {skills.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills & Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border bg-primary-50 text-primary-700 border-primary-200"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              {volunteer.notes && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Notes</h3>
                  <p className="text-gray-600 leading-relaxed">{volunteer.notes}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}