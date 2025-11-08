import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import RazorpayButton from './RazorpayButton';

const presetAmounts = [100, 500, 1000, 2500, 5000];
const causes = [
  { id: 'education', name: 'Education for All', icon: '📚' },
  { id: 'healthcare', name: 'Healthcare Access', icon: '🏥' },
  { id: 'women', name: 'Women Empowerment', icon: '💪' },
  { id: 'general', name: 'General Fund', icon: '❤️' }
];

export default function DonationForm({ onDonationSuccess }) {
  const [formData, setFormData] = useState({
    amount: '',
    customAmount: '',
    cause: 'general',
    name: '',
    email: '',
    phone: '',
    isAnonymous: false
  });
  const [isCustomAmount, setIsCustomAmount] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePresetAmount = (amount) => {
    setFormData(prev => ({
      ...prev,
      amount: amount,
      customAmount: ''
    }));
    setIsCustomAmount(false);
  };

  const handleCustomAmount = () => {
    setFormData(prev => ({
      ...prev,
      amount: ''
    }));
    setIsCustomAmount(true);
  };

  const handleSuccess = (paymentData) => {
    onDonationSuccess({
      ...paymentData,
      donorInfo: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      }
    });
    
    // Reset form
    setFormData({
      amount: '',
      customAmount: '',
      cause: 'general',
      name: '',
      email: '',
      phone: '',
      isAnonymous: false
    });
    setIsCustomAmount(false);
  };

  const handleError = (error) => {
    console.error('Donation error:', error);
  };

  const selectedCause = causes.find(c => c.id === formData.cause);
  const donationAmount = isCustomAmount ? parseInt(formData.customAmount) || 0 : parseInt(formData.amount) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-xl p-8"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <HeartIcon className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Make a Difference</h2>
        <p className="text-gray-600 mt-2">Your donation transforms lives and builds better futures</p>
      </div>

      {/* Cause Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Choose a Cause
        </label>
        <div className="grid grid-cols-2 gap-3">
          {causes.map((cause) => (
            <motion.button
              key={cause.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleInputChange('cause', cause.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                formData.cause === cause.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <div className="text-2xl mb-2">{cause.icon}</div>
              <div className="text-sm font-medium text-gray-900">{cause.name}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Amount Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Donation Amount (₹)
        </label>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {presetAmounts.map((amount) => (
            <motion.button
              key={amount}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePresetAmount(amount)}
              className={`py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                formData.amount === amount && !isCustomAmount
                  ? 'border-primary-500 bg-primary-500 text-white'
                  : 'border-gray-200 text-gray-700 hover:border-primary-300'
              }`}
            >
              ₹{amount}
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCustomAmount}
            className={`py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
              isCustomAmount
                ? 'border-primary-500 bg-primary-500 text-white'
                : 'border-gray-200 text-gray-700 hover:border-primary-300'
            }`}
          >
            Custom
          </motion.button>
        </div>

        {isCustomAmount && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4"
          >
            <input
              type="number"
              min="10"
              placeholder="Enter custom amount (min ₹10)"
              value={formData.customAmount}
              onChange={(e) => handleInputChange('customAmount', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </motion.div>
        )}
      </div>

      {/* Donor Information */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Your Information
        </label>
        
        <div className="space-y-4">
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center">
          <input
            type="checkbox"
            id="anonymous"
            checked={formData.isAnonymous}
            onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="anonymous" className="ml-2 text-sm text-gray-600">
            Donate anonymously
          </label>
        </div>
      </div>

      {/* Donation Summary */}
      {donationAmount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6 mb-6 border border-primary-200"
        >
          <h3 className="font-semibold text-gray-900 mb-2">Donation Summary</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600">{selectedCause?.name}</p>
              <p className="text-2xl font-bold text-primary-600">₹{donationAmount}</p>
            </div>
            <div className="text-3xl">{selectedCause?.icon}</div>
          </div>
        </motion.div>
      )}

      {/* Donate Button */}
      <RazorpayButton
        amount={donationAmount}
        cause={selectedCause?.name}
        donorInfo={formData}
        onSuccess={handleSuccess}
        onError={handleError}
      />

      {/* Security Badge */}
      <div className="mt-6 text-center">
        <div className="flex items-center justify-center text-gray-500 text-sm">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Secure payment powered by Razorpay
        </div>
      </div>
    </motion.div>
  );
}