import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, DocumentArrowUpIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext'; // Updated import

const BeneficiaryModal = ({ project, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    address: '',
    phone: '',
    explanation: '',
    proofFile: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const { user } = useAuth(); // Updated to use AuthContext

  // Pre-fill user data if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || `${user.firstName} ${user.lastName}`.trim() || user.name || user.email?.split('@')[0] || '',
        // Note: You might want to add phone number to your user object in the backend
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.age || formData.age < 1 || formData.age > 120) newErrors.age = 'Please enter a valid age';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.explanation.trim()) newErrors.explanation = 'Please explain why you need support';
    if (!formData.proofFile) newErrors.proofFile = 'Proof document is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          proofFile: 'Please upload a valid file (JPEG, PNG, JPG, PDF)'
        }));
        return;
      }

      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          proofFile: 'File size must be less than 5MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        proofFile: file
      }));

      // Clear file error
      setErrors(prev => ({
        ...prev,
        proofFile: ''
      }));

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would make the actual API call
      // const response = await fetch(`/api/projects/${project.id}/apply-beneficiary`, {
      //   method: 'POST',
      //   body: formData
      // });

      alert('Application submitted successfully! We will review your application and get back to you soon.');
      onClose();
    } catch (error) {
      console.error('Application error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, proofFile: null }));
    setFilePreview(null);
    setErrors(prev => ({ ...prev, proofFile: '' }));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Apply as Beneficiary</h3>
              <p className="text-gray-600 mt-1">for {project.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-colors ${
                      errors.fullName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="1"
                    max="120"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-colors ${
                      errors.age ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your age"
                  />
                  {errors.age && (
                    <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-colors ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complete Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-colors resize-none ${
                      errors.address ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your complete address with pin code"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why do you need support from this project? *
                </label>
                <textarea
                  name="explanation"
                  value={formData.explanation}
                  onChange={handleInputChange}
                  rows="4"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-colors resize-none ${
                    errors.explanation ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Please explain your situation and how this project will help you..."
                />
                {errors.explanation && (
                  <p className="mt-1 text-sm text-red-600">{errors.explanation}</p>
                )}
              </div>
            </div>

            {/* Proof Document */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Supporting Document</h4>
              <div className="space-y-4">
                {!formData.proofFile ? (
                  <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    errors.proofFile ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-primary-400'
                  }`}>
                    <DocumentArrowUpIcon className={`w-12 h-12 mx-auto mb-4 ${
                      errors.proofFile ? 'text-red-400' : 'text-gray-400'
                    }`} />
                    <p className="text-gray-600 mb-2">
                      Upload proof document (ID proof, income certificate, etc.)
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Supported formats: JPG, PNG, PDF (Max 5MB)
                    </p>
                    <label className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold cursor-pointer hover:bg-primary-700 transition-colors">
                      Choose File
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {filePreview ? (
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <DocumentArrowUpIcon className="w-12 h-12 text-gray-400" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{formData.proofFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(formData.proofFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
                {errors.proofFile && (
                  <p className="text-sm text-red-600">{errors.proofFile}</p>
                )}
              </div>
            </div>

            {/* Terms and Submit */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-600"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I confirm that the information provided is accurate and complete. 
                  I understand that any false information may lead to rejection of my application.
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BeneficiaryModal;