import { useState } from 'react';
import { 
  EnvelopeIcon, 
  MapPinIcon, 
  StarIcon,
  ClockIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

export default function VolunteerCards({ volunteers = [], onContactVolunteer }) {
  const [filter, setFilter] = useState('all');

  const categories = [
    { id: 'all', name: 'All Mentors' },
    { id: 'academic', name: 'Academic Support' },
    { id: 'career', name: 'Career Guidance' },
    { id: 'scholarship', name: 'Scholarship' },
    { id: 'stem', name: 'STEM Education' },
    { id: 'language', name: 'Language Support' }
  ];

  const filteredVolunteers = volunteers.filter(volunteer => {
    if (filter === 'all') return true;
    return volunteer.expertise.some(exp => 
      exp.toLowerCase().includes(filter.toLowerCase())
    );
  });

  return (
    <div>
      {/* Category Filter */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-white">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setFilter(category.id)}
              className={`px-6 py-3 text-sm font-medium rounded-md transition-colors ${
                filter === category.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Volunteers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredVolunteers.map((volunteer) => (
          <div
            key={volunteer.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
          >
            {/* Header Section with Gradient Background */}
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6">
              <div className="flex items-start space-x-4">
                <img
                  className="h-16 w-16 rounded-lg object-cover border-2 border-white/20"
                  src={volunteer.image}
                  alt={volunteer.name}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white truncate">
                        {volunteer.name}
                      </h3>
                      <p className="text-primary-100 font-medium text-sm mt-1">
                        {volunteer.role}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
                      <StarIcon className="h-4 w-4 text-yellow-300" />
                      <span className="text-sm font-medium text-white">{volunteer.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-primary-100 mt-2">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {volunteer.location} • {volunteer.experience}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="p-6 border-b border-gray-100">
              <p className="text-gray-600 text-sm leading-relaxed">
                {volunteer.bio}
              </p>
            </div>

            {/* Expertise Section */}
            <div className="p-6 border-b border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Areas of Expertise
              </h4>
              <div className="flex flex-wrap gap-2">
                {volunteer.expertise.map((area, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200"
                  >
                    <CheckBadgeIcon className="h-3 w-3 mr-1" />
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats and Specialties */}
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{volunteer.studentsMentored}</div>
                  <div className="text-xs text-gray-500">Students Mentored</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{volunteer.successRate}</div>
                  <div className="text-xs text-gray-500">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{volunteer.responseTime}</div>
                  <div className="text-xs text-gray-500">Avg Response</div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Specialized Services</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {volunteer.specialties.map((specialty, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-1 h-1 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      {specialty}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-500">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {volunteer.availability}
                </div>
                <button
                  onClick={() => onContactVolunteer(volunteer)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                >
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  Contact Mentor
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVolunteers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No education mentors found</h3>
          <p className="text-gray-500">Try selecting a different category</p>
        </div>
      )}
    </div>
  );
}