import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  ClockIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function ContactVolunteerModal({ isOpen, onClose, volunteer }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    problemType: '',
    problemDescription: '',
    urgency: 'medium',
    preferredContact: 'email'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const problemTypes = [
    'Education Issue',
    'Technical Problem',
    'Healthcare Question',
    'Document Help',
    'Resource Finding',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Problem submitted to volunteer:', {
      volunteer: volunteer?.name,
      ...formData
    });
    
    setIsSubmitting(false);
    setCurrentStep(3); // Success step
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setCurrentStep(1);
      setFormData({
        name: '',
        email: '',
        problemType: '',
        problemDescription: '',
        urgency: 'medium',
        preferredContact: 'email'
      });
    }, 300);
  };

  if (!volunteer) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-60 backdrop-blur-sm"
              onClick={handleClose}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative inline-block w-full max-w-2xl text-left align-bottom transition-all transform bg-white rounded-3xl shadow-2xl sm:my-8 sm:align-middle"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-primary-500 to-secondary-600 p-8 rounded-t-3xl">
                <button
                  onClick={handleClose}
                  className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors duration-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
                
                <div className="flex items-center space-x-4">
                  <img
                    className="h-16 w-16 rounded-2xl object-cover border-4 border-white/30 shadow-lg"
                    src={volunteer.image}
                    alt={volunteer.name}
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-white">Get Help from {volunteer.name}</h3>
                    <p className="text-primary-100">{volunteer.role}</p>
                    <div className="flex items-center text-primary-200 text-sm mt-1">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      Avg response: {volunteer.responseTime}
                    </div>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-center mt-6 space-x-4">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        currentStep >= step 
                          ? 'bg-white text-primary-600 shadow-lg' 
                          : 'bg-white/20 text-white'
                      }`}>
                        {step}
                      </div>
                      {step < 3 && (
                        <div className={`w-12 h-1 mx-2 rounded-full ${
                          currentStep > step ? 'bg-white' : 'bg-white/20'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Content */}
              <div className="p-8">
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Your Information</h4>
                      <p className="text-gray-600">Let's start with your basic details</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <UserIcon className="h-4 w-4 mr-2 text-primary-600" />
                          Your Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <EnvelopeIcon className="h-4 w-4 mr-2 text-primary-600" />
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        onClick={() => setCurrentStep(2)}
                        disabled={!formData.name || !formData.email}
                        className="px-8 py-3 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300"
                      >
                        Continue
                      </button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Describe Your Problem</h4>
                      <p className="text-gray-600">Help {volunteer.name} understand how they can assist you</p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Problem Type *</label>
                        <select
                          name="problemType"
                          required
                          value={formData.problemType}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 appearance-none bg-white"
                        >
                          <option value="">Select problem type</option>
                          {problemTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Urgency Level</label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'low', label: 'Low', desc: 'Can wait' },
                            { value: 'medium', label: 'Medium', desc: 'Need soon' },
                            { value: 'high', label: 'High', desc: 'Urgent' }
                          ].map((level) => (
                            <label key={level.value} className="relative">
                              <input
                                type="radio"
                                name="urgency"
                                value={level.value}
                                checked={formData.urgency === level.value}
                                onChange={handleChange}
                                className="sr-only"
                              />
                              <div className={`p-4 border-2 rounded-xl text-center cursor-pointer transition-all duration-200 ${
                                formData.urgency === level.value
                                  ? 'border-primary-500 bg-primary-50 shadow-md'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}>
                                <div className={`text-sm font-semibold ${
                                  formData.urgency === level.value ? 'text-primary-600' : 'text-gray-700'
                                }`}>
                                  {level.label}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{level.desc}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <ChatBubbleBottomCenterTextIcon className="h-4 w-4 mr-2 text-primary-600" />
                          Problem Description *
                        </label>
                        <textarea
                          name="problemDescription"
                          required
                          rows={5}
                          value={formData.problemDescription}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 resize-none"
                          placeholder="Please describe your problem in detail. Include any specific challenges, what you've tried already, and what outcome you're hoping for..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Preferred Contact Method</label>
                        <select
                          name="preferredContact"
                          value={formData.preferredContact}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                        >
                          <option value="email">Email</option>
                          <option value="phone">Phone Call</option>
                          <option value="video">Video Call</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="px-6 py-3 text-gray-700 font-semibold border-2 border-gray-300 rounded-xl hover:border-gray-400 transition-all duration-200"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.problemType || !formData.problemDescription}
                        className="px-8 py-3 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 flex items-center"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          'Send Request'
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <CheckCircleIcon className="h-10 w-10 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h4>
                    <p className="text-gray-600 mb-6">
                      Your problem has been shared with {volunteer.name}. They will contact you via {formData.preferredContact} within {volunteer.responseTime}.
                    </p>
                    <button
                      onClick={handleClose}
                      className="px-8 py-3 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      Close
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}