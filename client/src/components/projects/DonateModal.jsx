import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext'; 

const DonateModal = ({ project, onClose }) => {
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth(); 

  const presetAmounts = [500, 1000, 2000, 5000];

  const handleAmountSelect = (amt) => {
    setAmount(amt.toString());
    setCustomAmount('');
  };

  const handleCustomAmount = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    setAmount(value);
  };

  const handleDonate = async () => {
    if (!amount || amount < 10) {
      alert('Please enter a valid amount (minimum ₹10)');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would make the actual payment API call
      // const response = await fetch(`/api/projects/${project.id}/donate/initiate`, {
      //   method: 'POST',
      //   body: JSON.stringify({ amount: parseInt(amount) })
      // });

      alert(`Thank you for your donation of ₹${amount}! Payment processing would be implemented here.`);
      onClose();
    } catch (error) {
      console.error('Donation error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl max-w-md w-full p-6"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Support {project.title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Amount Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Select Donation Amount
            </label>
            
            {/* Preset Amounts */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {presetAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleAmountSelect(amt)}
                  className={`p-3 border-2 rounded-xl text-lg font-semibold transition-all ${
                    amount === amt.toString() 
                      ? 'border-primary-600 bg-primary-50 text-primary-700' 
                      : 'border-gray-200 text-gray-700 hover:border-primary-300'
                  }`}
                >
                  ₹{amt.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">₹</span>
              <input
                type="number"
                placeholder="Enter custom amount"
                value={customAmount}
                onChange={handleCustomAmount}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-1 focus:ring-primary-600 outline-none transition-colors"
                min="10"
              />
            </div>
          </div>

          {/* Project Progress */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Raised: ₹{project.collectedAmount.toLocaleString()}</span>
              <span>Goal: ₹{project.targetAmount.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary-500 to-secondary-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((project.collectedAmount / project.targetAmount) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDonate}
              disabled={isLoading || !amount}
              className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                'Donate Now'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DonateModal;