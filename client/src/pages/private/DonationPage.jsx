import { useState } from 'react';
import { motion } from 'framer-motion';
import DonationForm from '../../components/donation/DonationForm';
import DonationHistory from '../../components/donation/DonationHistory';
import PaymentSuccess from '../../components/donation/PaymentSuccess';

export default function DonationPage() {
  const [activeTab, setActiveTab] = useState('donate');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const handleDonationSuccess = (paymentData) => {
    setSuccessData(paymentData);
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Support Our Mission
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your donation helps us create lasting change through education, healthcare, 
            and economic empowerment programs in underserved communities.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('donate')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'donate'
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Make a Donation
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Donation History
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'donate' ? (
            <motion.div
              key="donate"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DonationForm onDonationSuccess={handleDonationSuccess} />
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <DonationHistory />
            </motion.div>
          )}
        </div>

        {/* Impact Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {[
            { number: '10,000+', label: 'Lives Impacted' },
            { number: '50+', label: 'Communities Served' },
            { number: '₹5M+', label: 'Total Funds Raised' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Success Modal */}
      {showSuccess && successData && (
        <PaymentSuccess
          paymentData={successData}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
}