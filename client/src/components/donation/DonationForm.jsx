import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone,
  Heart,
  CheckCircle2
} from 'lucide-react';
import RazorpayButton from './RazorpayButton.jsx';
import { authAPI } from '../../services/apiService.js';
import { toast } from 'react-hot-toast';

const presetAmounts = [500, 1000, 2000, 5000, 10000];
const causes = [
  { id: 'scholarship', name: 'Student Scholarships', icon: '🎓' },
  { id: 'digital-learning', name: 'Digital Learning Labs', icon: '💻' },
  { id: 'study-material', name: 'Study Material Kits', icon: '📚' },
  { id: 'girl-education', name: 'Girl Child Education', icon: '👧' }
];

export default function DonationForm({ onDonationSuccess }) {
  const [formData, setFormData] = useState({
    amount: '',
    customAmount: '',
    cause: 'scholarship',
    name: '',
    email: '',
    phone: '',
    isAnonymous: false
  });
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authAPI.getProfile();
        const userData = response.data;
        setUser(userData);
        setFormData(prev => ({
          ...prev,
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.profile?.phone || ''
        }));
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        if (error.response?.status !== 401) {
          toast.error('Failed to load user information');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

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
    setIsProcessing(false);
    onDonationSuccess({
      ...paymentData,
      donorInfo: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      }
    });
    
    setFormData({
      amount: '',
      customAmount: '',
      cause: 'scholarship',
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.profile?.phone || '',
      isAnonymous: false
    });
    setIsCustomAmount(false);
  };

  const handleError = (error) => {
    setIsProcessing(false);
    console.error('Donation error:', error);
    toast.error(error.message || 'Donation failed. Please try again.');
  };

  const handleProcessing = () => {
    setIsProcessing(true);
  };

  const selectedCause = causes.find(c => c.id === formData.cause);
  const donationAmount = isCustomAmount ? parseInt(formData.customAmount) || 0 : parseInt(formData.amount) || 0;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isProcessing && (
        <div className="absolute inset-0 bg-white bg-opacity-80 z-10 flex items-center justify-center rounded-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Donation</h3>
            <p className="text-gray-600">Please wait while we complete your donation...</p>
          </div>
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Fund a Student's Future</h2>
          <p className="text-gray-600 mt-2">Your donation provides education, resources, and opportunities to deserving students</p>
        </div>

        {/* Cause Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Choose Your Impact Area
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
                min="100"
                placeholder="Enter custom amount (min ₹100)"
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
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={!!user?.name}
              />
              {user?.name && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">From Profile</span>
                </div>
              )}
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={!!user?.email}
              />
              {user?.email && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">From Profile</span>
                </div>
              )}
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                {user && user.role === 'donor' && (
                  <p className="text-sm text-green-600 mt-1">✓ Thank you for being a regular education supporter!</p>
                )}
              </div>
              <div className="text-3xl">{selectedCause?.icon}</div>
            </div>
          </motion.div>
        )}

        {/* Donate Button */}
        <RazorpayButton
          amount={donationAmount}
          cause={formData.cause}
          causeName={selectedCause?.name}
          donorInfo={{
            name: formData.isAnonymous ? '' : formData.name,
            email: formData.isAnonymous ? '' : formData.email,
            phone: formData.isAnonymous ? '' : formData.phone,
            isAnonymous: formData.isAnonymous
          }}
          onSuccess={handleSuccess}
          onError={handleError}
        />

        {/* Security Badge */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center text-gray-500 text-sm">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Secure payment powered by Razorpay
          </div>
        </div>
      </motion.div>
    </div>
  );
}