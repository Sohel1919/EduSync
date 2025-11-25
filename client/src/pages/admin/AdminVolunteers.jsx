import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { FaUsers, FaCalendar, FaMapMarkerAlt } from 'react-icons/fa';
import VolunteerCard from './components/volunteer/VolunteerCard';
import VolunteerForm from './components/volunteer/VolunteerForm';
import VolunteerDetailsModal from './components/volunteer/VolunteerDetailsModal';
import { volunteersAPI } from '../../services/apiService';
import { showToast } from '../../utils/toast';

const skills = [
  { value: 'all', label: 'All Skills' },
  { value: 'teaching', label: 'Teaching' },
  { value: 'medical', label: 'Medical' },
  { value: 'construction', label: 'Construction' },
  { value: 'counseling', label: 'Counseling' },
  { value: 'technical', label: 'Technical' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'fundraising', label: 'Fundraising' }
];

const statuses = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' }
];

const availability = [
  { value: 'all', label: 'All Availability' },
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'evenings', label: 'Evenings' }
];

export default function AdminVolunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  const volunteersPerPage = 10;

  // Fetch volunteers from API
  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const response = await volunteersAPI.getAll();
      
      let volunteersData = [];
      
      // Handle different possible response structures
      if (Array.isArray(response.data)) {
        volunteersData = response.data;
      } else if (response.data && Array.isArray(response.data.volunteers)) {
        volunteersData = response.data.volunteers;
      } else if (response.data && Array.isArray(response.data.data)) {
        volunteersData = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        volunteersData = [response.data];
      } else {
        volunteersData = [];
      }
      
      console.log('Fetched volunteers:', volunteersData);
      setVolunteers(volunteersData);
      setFilteredVolunteers(volunteersData);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      // For demo purposes, use mock data
      const mockVolunteers = generateMockVolunteers();
      setVolunteers(mockVolunteers);
      setFilteredVolunteers(mockVolunteers);
      showToast.info('Using demo data - Backend not connected');
    } finally {
      setLoading(false);
    }
  };

  // Generate mock volunteers for demo
  const generateMockVolunteers = () => {
    const mockData = [
      {
        _id: '1',
        fullName: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        phone: '+91 98765 43210',
        location: 'Mumbai, Maharashtra',
        skills: ['teaching', 'counseling'],
        availability: 'weekends',
        status: 'active',
        joinDate: '2024-01-15',
        profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        hoursCompleted: 120,
        eventsAttended: 15,
        bio: 'Passionate about education and child development. Have been volunteering for 3 years.',
        address: 'Andheri East, Mumbai',
        dateOfBirth: '1990-05-15',
        emergencyContact: {
          name: 'Raj Sharma',
          phone: '+91 98765 43211',
          relation: 'Brother'
        }
      },
      {
        _id: '2',
        fullName: 'Rahul Kumar',
        email: 'rahul.kumar@example.com',
        phone: '+91 87654 32109',
        location: 'Delhi, NCR',
        skills: ['technical', 'administrative'],
        availability: 'part-time',
        status: 'active',
        joinDate: '2024-02-20',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        hoursCompleted: 85,
        eventsAttended: 8,
        bio: 'IT professional with 5 years of experience. Skilled in web development and database management.',
        address: 'Connaught Place, Delhi',
        dateOfBirth: '1988-08-22',
        emergencyContact: {
          name: 'Sunita Kumar',
          phone: '+91 87654 32110',
          relation: 'Sister'
        }
      }
    ];
    return mockData;
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  // Safe stats calculation
  const calculateStats = (volunteersArray) => {
    if (!Array.isArray(volunteersArray) || volunteersArray.length === 0) {
      return {
        totalVolunteers: 0,
        activeVolunteers: 0,
        totalHours: 0,
        totalEvents: 0
      };
    }

    const activeVolunteers = volunteersArray.filter(v => v.status === 'active').length;
    const totalHours = volunteersArray.reduce((sum, volunteer) => sum + (Number(volunteer.hoursCompleted) || 0), 0);
    const totalEvents = volunteersArray.reduce((sum, volunteer) => sum + (Number(volunteer.eventsAttended) || 0), 0);

    return {
      totalVolunteers: volunteersArray.length,
      activeVolunteers,
      totalHours,
      totalEvents
    };
  };

  const stats = calculateStats(volunteers);

  // Safe filter and search volunteers
  useEffect(() => {
    if (!Array.isArray(volunteers)) {
      setFilteredVolunteers([]);
      return;
    }

    let filtered = volunteers.filter(volunteer => {
      if (!volunteer || typeof volunteer !== 'object') return false;

      const searchLower = searchTerm.toLowerCase();
      const fullName = String(volunteer.fullName || '');
      const email = String(volunteer.email || '');
      const location = String(volunteer.location || '');
      const skills = Array.isArray(volunteer.skills) ? volunteer.skills : [];
      
      const matchesSearch = 
        fullName.toLowerCase().includes(searchLower) ||
        email.toLowerCase().includes(searchLower) ||
        location.toLowerCase().includes(searchLower) ||
        skills.some(skill => skill.toLowerCase().includes(searchLower));
      
      const matchesSkill = selectedSkill === 'all' || 
        (Array.isArray(volunteer.skills) && volunteer.skills.includes(selectedSkill));
      const matchesStatus = selectedStatus === 'all' || volunteer.status === selectedStatus;
      const matchesAvailability = selectedAvailability === 'all' || volunteer.availability === selectedAvailability;
      
      return matchesSearch && matchesSkill && matchesStatus && matchesAvailability;
    });

    // Sort volunteers safely
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.joinDate || 0) - new Date(a.joinDate || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.joinDate || 0) - new Date(b.joinDate || 0));
        break;
      case 'most-hours':
        filtered.sort((a, b) => (Number(b.hoursCompleted) || 0) - (Number(a.hoursCompleted) || 0));
        break;
      case 'most-events':
        filtered.sort((a, b) => (Number(b.eventsAttended) || 0) - (Number(a.eventsAttended) || 0));
        break;
      case 'name-asc':
        filtered.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
        break;
      case 'name-desc':
        filtered.sort((a, b) => (b.fullName || '').localeCompare(a.fullName || ''));
        break;
      default:
        break;
    }

    setFilteredVolunteers(filtered);
    setCurrentPage(1);
  }, [volunteers, searchTerm, selectedSkill, selectedStatus, selectedAvailability, sortBy]);

  // Pagination
  const indexOfLastVolunteer = currentPage * volunteersPerPage;
  const indexOfFirstVolunteer = indexOfLastVolunteer - volunteersPerPage;
  const currentVolunteers = filteredVolunteers.slice(indexOfFirstVolunteer, indexOfLastVolunteer);
  const totalPages = Math.ceil(filteredVolunteers.length / volunteersPerPage);

  const handleCreateVolunteer = () => {
    setSelectedVolunteer(null);
    setShowForm(true);
  };

  const handleEditVolunteer = async (volunteerData) => {
    try {
      if (selectedVolunteer) {
        await volunteersAPI.update(selectedVolunteer._id, volunteerData);
        showToast.success('Volunteer updated successfully!');
      } else {
        await volunteersAPI.create(volunteerData);
        showToast.success('Volunteer created successfully!');
      }
      fetchVolunteers();
      setShowForm(false);
      setSelectedVolunteer(null);
    } catch (error) {
      console.error('Error saving volunteer:', error);
      // For demo, update locally
      if (selectedVolunteer) {
        const updatedVolunteers = volunteers.map(v => 
          v._id === selectedVolunteer._id ? { ...v, ...volunteerData } : v
        );
        setVolunteers(updatedVolunteers);
        showToast.success('Volunteer updated successfully! (Demo)');
      } else {
        const newVolunteer = {
          _id: Date.now().toString(),
          ...volunteerData,
          joinDate: new Date().toISOString().split('T')[0],
          hoursCompleted: 0,
          eventsAttended: 0
        };
        setVolunteers(prev => [newVolunteer, ...prev]);
        showToast.success('Volunteer created successfully! (Demo)');
      }
      setShowForm(false);
      setSelectedVolunteer(null);
    }
  };

  const handleDeleteVolunteer = async (volunteerId) => {
    if (!window.confirm('Are you sure you want to delete this volunteer?')) {
      return;
    }

    try {
      await volunteersAPI.delete(volunteerId);
      showToast.success('Volunteer deleted successfully');
      fetchVolunteers();
    } catch (error) {
      console.error('Error deleting volunteer:', error);
      // For demo, delete locally
      const updatedVolunteers = volunteers.filter(v => v._id !== volunteerId);
      setVolunteers(updatedVolunteers);
      showToast.success('Volunteer deleted successfully (Demo)');
    }
  };

  const openEditForm = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowForm(true);
  };

  const openDetails = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowDetails(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedVolunteer(null);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedVolunteer(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Volunteers Management</h1>
            <p className="text-gray-600 mt-2">Manage and coordinate volunteer activities</p>
          </div>
          <button
            onClick={handleCreateVolunteer}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Volunteer
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { 
              name: 'Total Volunteers', 
              value: stats.totalVolunteers, 
              icon: FaUsers, 
              color: 'bg-blue-500'
            },
            { 
              name: 'Active Volunteers', 
              value: stats.activeVolunteers, 
              icon: FaUsers, 
              color: 'bg-green-500'
            },
            { 
              name: 'Total Hours', 
              value: stats.totalHours, 
              icon: FaCalendar, 
              color: 'bg-purple-500'
            },
            { 
              name: 'Events Attended', 
              value: stats.totalEvents, 
              icon: FaMapMarkerAlt, 
              color: 'bg-amber-500'
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd className="text-lg font-semibold text-gray-900">{stat.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search volunteers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Skill Filter */}
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              {skills.map(skill => (
                <option key={skill.value} value={skill.value}>
                  {skill.label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {/* Availability Filter */}
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              {availability.map(avail => (
                <option key={avail.value} value={avail.value}>
                  {avail.label}
                </option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most-hours">Most Hours</option>
              <option value="most-events">Most Events</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>
          </div>
        </div>

        {/* Volunteers List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Volunteers ({filteredVolunteers.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-4">
                    <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : currentVolunteers.length === 0 ? (
            <div className="text-center py-12">
              <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No volunteers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedSkill !== 'all' || selectedStatus !== 'all' 
                  ? 'Try adjusting your search or filter to find what you are looking for.'
                  : 'Get started by adding a new volunteer.'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {currentVolunteers.map((volunteer, index) => (
                  <VolunteerCard
                    key={volunteer._id || volunteer.id}
                    volunteer={volunteer}
                    index={index}
                    onView={openDetails}
                    onEdit={openEditForm}
                    onDelete={handleDeleteVolunteer}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstVolunteer + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastVolunteer, filteredVolunteers.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredVolunteers.length}</span> results
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg ${
                            currentPage === page
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Volunteer Form Modal */}
        {showForm && (
          <VolunteerForm
            volunteer={selectedVolunteer}
            onSave={handleEditVolunteer}
            onClose={closeForm}
            refreshVolunteers={fetchVolunteers}
          />
        )}

        {/* Volunteer Details Modal */}
        {showDetails && selectedVolunteer && (
          <VolunteerDetailsModal
            volunteer={selectedVolunteer}
            onClose={closeDetails}
            onEdit={() => {
              closeDetails();
              openEditForm(selectedVolunteer);
            }}
          />
        )}
      </div>
    </div>
  );
}