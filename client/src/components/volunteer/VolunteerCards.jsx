import { useState } from 'react';
import { 
  EnvelopeIcon, 
  MapPinIcon, 
  StarIcon,
  ClockIcon,
  CheckBadgeIcon,
  ComputerDesktopIcon,
  CreditCardIcon,
  BanknotesIcon,
  UserGroupIcon,
  UsersIcon,
  AcademicCapIcon,
  CodeBracketIcon,
  PencilSquareIcon,
  MegaphoneIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Skills options with icons
const skillsOptions = [
  { id: 'all', label: 'All Volunteers', icon: UsersIcon },
  { id: 'technical-support', label: 'Technical Support', icon: ComputerDesktopIcon },
  { id: 'payment-support', label: 'Payment Support', icon: CreditCardIcon },
  { id: 'donation-support', label: 'Donation Management', icon: BanknotesIcon },
  { id: 'beneficiary-support', label: 'Beneficiary Support', icon: UserGroupIcon },
  { id: 'volunteer-support', label: 'Volunteer Support', icon: UsersIcon },
  { id: 'mentoring', label: 'Student Mentor', icon: AcademicCapIcon },
  { id: 'developer', label: 'Web Developer', icon: CodeBracketIcon },
  { id: 'content-creation', label: 'Content Creator', icon: PencilSquareIcon },
  { id: 'community-outreach', label: 'Community Outreach', icon: MegaphoneIcon }
];

export default function VolunteerCards({ volunteers = [], onContactVolunteer }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAllFilters, setShowAllFilters] = useState(false);

  const filteredVolunteers = volunteers.filter(volunteer => {
    if (activeCategory === 'all') return true;
    
    // Check if volunteer has this skill in their expertise
    return volunteer.expertise.some(skill => 
      skill === activeCategory
    );
  });

  // Get label for a skill
  const getSkillLabel = (skillId) => {
    const skill = skillsOptions.find(s => s.id === skillId);
    return skill ? skill.label : skillId;
  };

  // Get visible categories (first 6 + more toggle)
  const visibleCategories = showAllFilters ? skillsOptions : skillsOptions.slice(0, 6);
  const hasHiddenCategories = skillsOptions.length > 6;

  return (
    <div>
      {/* Modern Filter Header */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-6 mb-8 border border-primary-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left Section: Stats and Title */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <FunnelIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Find Your Perfect Volunteer</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Filter by expertise area to find the right match
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                <span className="font-medium text-gray-700">Total Volunteers: </span>
                <span className="font-bold text-primary-600 ml-1">{volunteers.length}</span>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                <span className="font-medium text-gray-700">Showing: </span>
                <span className="font-bold text-primary-600 ml-1">{filteredVolunteers.length}</span>
              </div>
            </div>
          </div>

          {/* Right Section: Active Filter */}
          {activeCategory !== 'all' && (
            <div className="bg-white px-4 py-3 rounded-xl border border-primary-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="text-sm">
                  <span className="text-gray-600">Active Filter:</span>
                  <span className="font-semibold text-primary-700 ml-2">
                    {getSkillLabel(activeCategory)}
                  </span>
                </div>
                <button
                  onClick={() => setActiveCategory('all')}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Clear filter"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="mt-6">
          <div className="flex flex-wrap gap-3">
            {visibleCategories.map((category) => {
              const Icon = category.icon;
              const count = category.id === 'all' 
                ? volunteers.length 
                : volunteers.filter(v => v.expertise.includes(category.id)).length;
              
              const isActive = activeCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`
                    group relative flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg border-transparent'
                      : 'bg-white/80 backdrop-blur-sm border-gray-200 text-gray-700 hover:border-primary-300 hover:shadow-md hover:bg-white'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-white"></div>
                  )}
                  
                  <Icon className={`
                    h-5 w-5 transition-colors
                    ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-primary-500'}
                  `} />
                  
                  <span className="font-medium text-sm whitespace-nowrap">{category.label}</span>
                  
                  <span className={`
                    inline-flex items-center justify-center h-6 min-w-6 px-1 text-xs font-medium rounded-full
                    ${isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-600'
                    }
                  `}>
                    {count}
                  </span>
                </button>
              );
            })}
            
            {/* Show More/Less Toggle */}
            {hasHiddenCategories && (
              <button
                onClick={() => setShowAllFilters(!showAllFilters)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:text-primary-600 hover:shadow-md transition-all duration-200"
              >
                <span className="font-medium text-sm">
                  {showAllFilters ? 'Show Less' : `+${skillsOptions.length - 6} More`}
                </span>
              </button>
            )}
          </div>
          
          {/* Filter Description */}
          <div className="mt-4 text-sm text-gray-600">
            {activeCategory === 'all' ? (
              <p>Showing all volunteers across all skill categories</p>
            ) : (
              <p>
                Showing <span className="font-semibold text-primary-600">{filteredVolunteers.length}</span> 
                {' '}volunteers skilled in <span className="font-semibold text-primary-600">{getSkillLabel(activeCategory).toLowerCase()}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Original Card Design (Unchanged) */}
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
                    {getSkillLabel(area)}
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