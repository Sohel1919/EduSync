import { useState } from 'react';
import { 
  EnvelopeIcon, 
  MapPinIcon, 
  StarIcon,
  ClockIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

const volunteers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Education Consultant',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    location: 'New York, NY',
    experience: '8 years experience',
    expertise: ['Academic Guidance', 'Career Counseling', 'Educational Resources'],
    availability: 'Weekdays: 9 AM - 6 PM EST',
    responseTime: '2-4 hours',
    rating: 4.9,
    problemsSolved: 156,
    successRate: '94%',
    bio: 'Former university admissions officer with extensive experience helping students navigate educational pathways and career decisions.',
    specialties: [
      'University admissions guidance',
      'Career path planning',
      'Academic resource coordination',
      'Educational program navigation'
    ]
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Technology Specialist',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    location: 'San Francisco, CA',
    experience: '12 years experience',
    expertise: ['Technical Support', 'Digital Solutions', 'Software Guidance'],
    availability: 'Flexible scheduling',
    responseTime: '1-2 hours',
    rating: 4.8,
    problemsSolved: 203,
    successRate: '96%',
    bio: 'Senior IT consultant specializing in helping individuals and small businesses implement effective technology solutions.',
    specialties: [
      'Software implementation',
      'Technical troubleshooting',
      'Digital tool selection',
      'System optimization'
    ]
  },
  {
    id: 3,
    name: 'Priya Sharma',
    role: 'Healthcare Navigator',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    location: 'Chicago, IL',
    experience: '10 years experience',
    expertise: ['Medical Guidance', 'Insurance Navigation', 'Healthcare Access'],
    availability: 'By appointment',
    responseTime: '4-6 hours',
    rating: 4.9,
    problemsSolved: 178,
    successRate: '97%',
    bio: 'Healthcare administrator with deep knowledge of medical systems, insurance processes, and patient advocacy.',
    specialties: [
      'Insurance claim assistance',
      'Medical provider coordination',
      'Healthcare resource access',
      'Treatment plan guidance'
    ]
  },
  {
    id: 4,
    name: 'David Rodriguez',
    role: 'Legal Document Specialist',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    location: 'Miami, FL',
    experience: '6 years experience',
    expertise: ['Document Preparation', 'Form Assistance', 'Legal Guidance'],
    availability: 'Weekdays: 10 AM - 4 PM EST',
    responseTime: '3-5 hours',
    rating: 4.7,
    problemsSolved: 132,
    successRate: '91%',
    bio: 'Paralegal with expertise in document preparation and legal form assistance for various personal and business needs.',
    specialties: [
      'Legal form completion',
      'Document review',
      'Application assistance',
      'Compliance guidance'
    ]
  }
];

export default function VolunteerCards({ onContactVolunteer }) {
  const [filter, setFilter] = useState('all');

  const categories = [
    { id: 'all', name: 'All Professionals' },
    { id: 'education', name: 'Education' },
    { id: 'technology', name: 'Technology' },
    { id: 'healthcare', name: 'Healthcare' },
    { id: 'legal', name: 'Legal' }
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
                  <div className="text-lg font-semibold text-gray-900">{volunteer.problemsSolved}</div>
                  <div className="text-xs text-gray-500">Cases Handled</div>
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
                  Contact Professional
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVolunteers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No professionals found</h3>
          <p className="text-gray-500">Try selecting a different category</p>
        </div>
      )}
    </div>
  );
}