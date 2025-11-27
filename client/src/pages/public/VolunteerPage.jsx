import { useState, useEffect } from 'react';
import VolunteerCards from '../../components/volunteer/VolunteerCards';
import ContactVolunteerModal from '../../components/volunteer/ContactVolunteerModal';
import { volunteersAPI } from '../../services/apiService.js';

export default function VolunteerPage() {
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch volunteers data
  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        setLoading(true);
        const response = await volunteersAPI.getAll();
        
        if (response.data.success) {
          // Transform API data to match component structure
          const transformedVolunteers = response.data.volunteers.map(volunteer => ({
            id: volunteer._id,
            name: volunteer.fullName,
            role: volunteer.skills?.[0] ? `${volunteer.skills[0]} Specialist` : 'Volunteer',
            image: volunteer.profileImage?.url || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
            location: volunteer.location || 'Location not specified',
            experience: `${Math.floor(Math.random() * 10) + 1} years experience`, // You might want to add this field to your schema
            expertise: volunteer.skills || ['General Assistance'],
            availability: volunteer.availability ? `${volunteer.availability} availability` : 'Flexible scheduling',
            responseTime: '2-4 hours', // You might want to add this field to your schema
            rating: 4.5 + (Math.random() * 0.5), // Random rating between 4.5-5.0
            problemsSolved: Math.floor(Math.random() * 200) + 50, // Random number
            successRate: `${Math.floor(Math.random() * 10) + 90}%`, // Random success rate
            bio: volunteer.bio || `Experienced ${volunteer.skills?.[0] || 'volunteer'} dedicated to helping others.`,
            specialties: volunteer.skills?.map(skill => `${skill} services`) || ['General volunteer services']
          }));
          
          setVolunteers(transformedVolunteers);
        } else {
          setError('Failed to fetch volunteers');
        }
      } catch (err) {
        console.error('Error fetching volunteers:', err);
        setError('Error loading volunteers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteers();
  }, []);

  const handleContactVolunteer = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setIsContactModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsContactModalOpen(false);
    setSelectedVolunteer(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading volunteers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Volunteers</h3>
          <p className="text-gray-500">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Volunteers
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with experienced professionals ready to help you solve challenges and achieve your goals.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            {volunteers.length} volunteers available
          </div>
        </div>

        <VolunteerCards 
          volunteers={volunteers} 
          onContactVolunteer={handleContactVolunteer} 
        />
        
        <ContactVolunteerModal
          isOpen={isContactModalOpen}
          onClose={handleCloseModal}
          volunteer={selectedVolunteer}
        />
      </div>
    </div>
  );
}