import { useState } from 'react';
import VolunteerCards from '../../components/volunteer/VolunteerCards';
import ContactVolunteerModal from '../../components/volunteer/ContactVolunteerModal';

export default function VolunteerPage() {
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const handleContactVolunteer = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setIsContactModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsContactModalOpen(false);
    setSelectedVolunteer(null);
  };

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
        </div>

        <VolunteerCards onContactVolunteer={handleContactVolunteer} />
        
        <ContactVolunteerModal
          isOpen={isContactModalOpen}
          onClose={handleCloseModal}
          volunteer={selectedVolunteer}
        />
      </div>
    </div>
  );
}