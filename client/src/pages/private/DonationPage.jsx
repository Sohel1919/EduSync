import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DonationForm from '../../components/donation/DonationForm.jsx';
import DonationHistory from '../../components/donation/DonationHistory.jsx';
import PaymentSuccess from '../../components/donation/PaymentSuccess.jsx';
import { donationsAPI } from '../../services/apiService.js';
import Loader from '../../components/common/Loader.jsx';
import { toast } from 'react-hot-toast';

export default function DonationPage() {
  const [activeTab, setActiveTab] = useState('donate');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [donationStats, setDonationStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState('checking');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    checkApiStatus();
    fetchDonationStats();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await donationsAPI.getStatus();
      if (response.data.success) {
        setApiStatus('connected');
      } else {
        setApiStatus('error');
      }
    } catch (error) {
      console.error('API connection error:', error);
      setApiStatus('error');
    }
  };

  const fetchDonationStats = async () => {
    try {
      const response = await donationsAPI.getStatistics();
      setDonationStats(response.data);
    } catch (error) {
      console.error('Error fetching donation stats:', error);
      if (error.response?.status !== 401) {
        toast.error('Failed to load donation statistics');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDonationSuccess = (paymentData) => {
    setProcessingPayment(false);
    setSuccessData(paymentData);
    setShowSuccess(true);
    fetchDonationStats();
  };

  const handleDonationProcessing = () => {
    setProcessingPayment(true);
  };

  const handleDonationError = (error) => {
    setProcessingPayment(false);
    toast.error(error.message || 'Donation failed. Please try again.');
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* API Status Indicator */}
        {apiStatus === 'error' && (
          <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
            <p className="text-yellow-800">
              ⚠️ Unable to connect to server. Please make sure the backend is running on port 5000.
            </p>
          </div>
        )}

        {/* Global Payment Processing Overlay */}
        {processingPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Your Donation</h3>
              <p className="text-gray-600 mb-4">
                Please wait while we complete your donation process...
              </p>
              <div className="text-sm text-gray-500">
                Do not refresh or close this window
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Empower Students Through Education
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your donation provides educational resources, scholarships, mentorship, and digital learning 
            opportunities to underprivileged and rural students across India.
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
              <DonationForm 
                onDonationSuccess={handleDonationSuccess}
                onDonationProcessing={handleDonationProcessing}
                onDonationError={handleDonationError}
              />
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
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-gray-300 mb-2 animate-pulse">•••••</div>
                <div className="text-gray-400 animate-pulse">Loading...</div>
              </div>
            ))
          ) : donationStats ? (
            [
              { 
                number: `${formatNumber(donationStats.total?.donors || 0)}+`, 
                label: 'Students Supported' 
              },
              { 
                number: `${formatNumber(donationStats.total?.donations || 0)}+`, 
                label: 'Educational Kits Distributed' 
              },
              { 
                number: `₹${formatNumber(donationStats.total?.amount || 0)}+`, 
                label: 'Scholarship Funds Raised' 
              }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))
          ) : (
            [
              { number: '15,000+', label: 'Students Supported' },
              { number: '45,000+', label: 'Educational Kits Distributed' },
              { number: '₹8.5M+', label: 'Scholarship Funds Raised' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))
          )}
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