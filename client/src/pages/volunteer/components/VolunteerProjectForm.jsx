import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { FaImage, FaTag, FaCalendar, FaMapMarkerAlt, FaUsers, FaRupeeSign, FaBuilding, FaFileAlt } from 'react-icons/fa';
import { projectRequestsAPI } from '../../../services/apiService';
import { showToast } from '../../../utils/toast';

const categories = [
  { value: 'digital-learning', label: 'Digital Learning' },
  { value: 'scholarship', label: 'Scholarship Assistance' },
  { value: 'mentorship', label: 'Mentorship Program' },
  { value: 'skill-development', label: 'Skill Development' },
  { value: 'school-infrastructure', label: 'School Infrastructure' },
  { value: 'girl-education', label: 'Girl Education' },
  { value: 'after-school', label: 'After School Program' },
  { value: 'vocational-training', label: 'Vocational Training' }
];

const initialFormData = {
  title: '',
  summary: '',
  description: '',
  category: 'education',
  targetAmount: '',
  collectedAmount: '',
  deadline: '',
  images: [],
  tags: [],
  beneficiaries: '',
  organization: '',
  location: '',
  status: 'pending' // Volunteer projects start as pending for approval
};

const steps = [
  { id: 1, title: 'Basic Info', icon: FaFileAlt },
  { id: 2, title: 'Project Details', icon: FaRupeeSign },
  { id: 3, title: 'Organization', icon: FaBuilding },
  { id: 4, title: 'Media & Tags', icon: FaImage }
];

export default function VolunteerProjectForm({ project, onSave, onClose, refreshProjects }) {
  const [formData, setFormData] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [newTag, setNewTag] = useState('');
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        ...project,
        targetAmount: project.targetAmount?.toString() || '',
        collectedAmount: project.collectedAmount?.toString() || '',
        beneficiaries: project.beneficiaries?.toString() || '',
        deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
        images: project.images || [],
        tags: project.tags || []
      });
      setImagePreviews(project.images || []);
    }
  }, [project]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imagePreviews.length > 5) {
      showToast.error('Maximum 5 images allowed');
      return;
    }

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        showToast.error('Please upload only image files');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target.result]);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, e.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateCurrentStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.title.trim()) newErrors.title = 'Project title is required';
      if (!formData.summary.trim()) newErrors.summary = 'Short summary is required';
      if (!formData.description.trim()) newErrors.description = 'Detailed description is required';
    }

    if (currentStep === 2) {
      if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) 
        newErrors.targetAmount = 'Valid target amount is required';
      if (!formData.deadline) newErrors.deadline = 'Project deadline is required';
      if (!formData.beneficiaries || parseInt(formData.beneficiaries) <= 0)
        newErrors.beneficiaries = 'Valid number of beneficiaries is required';
      
      if (formData.deadline) {
        const deadlineDate = new Date(formData.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (deadlineDate <= today) {
          newErrors.deadline = 'Deadline must be in the future';
        }
      }
    }

    if (currentStep === 3) {
      if (!formData.organization.trim()) newErrors.organization = 'Organization name is required';
      if (!formData.location.trim()) newErrors.location = 'Project location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);

    try {
      // Prepare data for API - ensure proper data types
      const submitData = {
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        description: formData.description.trim(),
        category: formData.category,
        targetAmount: parseFloat(formData.targetAmount),
        collectedAmount: parseFloat(formData.collectedAmount || 0),
        beneficiaries: parseInt(formData.beneficiaries),
        deadline: new Date(formData.deadline).toISOString(),
        images: formData.images,
        tags: formData.tags,
        organization: formData.organization.trim(),
        location: formData.location.trim(),
        status: project ? formData.status : 'pending' // New projects are pending
      };

      console.log('Submitting project request data:', submitData);

      let response;
      if (project) {
        response = await projectRequestsAPI.update(project._id, submitData);
        showToast.success('Project request updated successfully!');
      } else {
        response = await projectRequestsAPI.create(submitData);
        showToast.success('Project request submitted successfully and waiting for approval!');
      }

      if (onSave) onSave(response.data);
      if (refreshProjects) refreshProjects();
      onClose();

    } catch (error) {
      console.error('Error saving project request:', error);
      
      // Handle different error types
      if (error.response?.status === 400) {
        const serverError = error.response.data;
        if (serverError.errors) {
          // Handle validation errors from server
          const fieldErrors = {};
          serverError.errors.forEach(err => {
            fieldErrors[err.path] = err.msg;
          });
          setErrors(fieldErrors);
          showToast.error('Please check the form for errors');
        } else {
          showToast.error(serverError.message || 'Invalid data provided');
        }
      } else if (error.response?.status === 404) {
        showToast.error('Server endpoint not found. Please check API configuration.');
      } else if (error.code === 'NETWORK_ERROR') {
        showToast.error('Network error. Please check your connection.');
      } else {
        showToast.error(error.response?.data?.message || 'Failed to save project request');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentStep === 4) {
        addTag();
      }
    }
  };

  // Fix: Prevent form submission on Enter key in step navigation
  const handleFormKeyPress = (e) => {
    if (e.key === 'Enter' && currentStep < steps.length) {
      e.preventDefault();
      nextStep();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {project ? 'Edit Project Request' : 'Create New Project Request'}
              </h2>
              <p className="text-gray-600 mt-1">
                Step {currentStep} of {steps.length}: {steps.find(s => s.id === currentStep)?.title}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep > step.id 
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : currentStep === step.id
                      ? 'border-primary-600 bg-white text-primary-600'
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-primary-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} onKeyPress={handleFormKeyPress} className="overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="p-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      placeholder="Enter project title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Short Summary *
                    </label>
                    <textarea
                      name="summary"
                      value={formData.summary}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.summary ? 'border-red-500' : 'border-gray-300'
                      } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      placeholder="Brief description of the project"
                    />
                    {errors.summary && (
                      <p className="mt-1 text-sm text-red-600">{errors.summary}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Detailed Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      rows={5}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      placeholder="Comprehensive project description"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Project Details */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      >
                        {categories.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {project && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Amount (₹) *
                      </label>
                      <div className="relative">
                        <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          name="targetAmount"
                          value={formData.targetAmount}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                            errors.targetAmount ? 'border-red-500' : 'border-gray-300'
                          } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          placeholder="50000"
                          min="1"
                        />
                      </div>
                      {errors.targetAmount && (
                        <p className="mt-1 text-sm text-red-600">{errors.targetAmount}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Collected Amount (₹)
                      </label>
                      <div className="relative">
                        <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          name="collectedAmount"
                          value={formData.collectedAmount}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deadline *
                      </label>
                      <div className="relative">
                        <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          name="deadline"
                          value={formData.deadline}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                            errors.deadline ? 'border-red-500' : 'border-gray-300'
                          } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      {errors.deadline && (
                        <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Beneficiaries *
                      </label>
                      <div className="relative">
                        <FaUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          name="beneficiaries"
                          value={formData.beneficiaries}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                            errors.beneficiaries ? 'border-red-500' : 'border-gray-300'
                          } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          placeholder="250"
                          min="1"
                        />
                      </div>
                      {errors.beneficiaries && (
                        <p className="mt-1 text-sm text-red-600">{errors.beneficiaries}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Organization */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Name *
                      </label>
                      <div className="relative">
                        <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="organization"
                          value={formData.organization}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                            errors.organization ? 'border-red-500' : 'border-gray-300'
                          } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          placeholder="Enter organization name"
                        />
                      </div>
                      {errors.organization && (
                        <p className="mt-1 text-sm text-red-600">{errors.organization}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                      </label>
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                            errors.location ? 'border-red-500' : 'border-gray-300'
                          } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          placeholder="Enter project location"
                        />
                      </div>
                      {errors.location && (
                        <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Media & Tags */}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Project Images
                    </label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <label className="flex flex-col items-center justify-center cursor-pointer">
                          <FaImage className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5 images</p>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isSubmitting}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-20 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                disabled={isSubmitting}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full text-xs"
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Project Tags
                    </label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <div className="relative">
                            <FaTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyPress={handleKeyPress}
                              disabled={isSubmitting}
                              placeholder="Add a tag"
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={addTag}
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                          Add
                        </button>
                      </div>

                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                disabled={isSubmitting}
                                className="ml-2 text-gray-500 hover:text-gray-700"
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Approval Notice for New Projects */}
                  {!project && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-yellow-900 mb-2">Approval Required</h3>
                      <p className="text-yellow-700 text-sm">
                        Your project request will be submitted for admin approval. 
                        You will be notified once it's reviewed. 
                        Approved projects will appear on the platform for donations.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1 || isSubmitting}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-2" />
                Previous
              </button>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  Cancel
                </button>

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={isSubmitting}
                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    Next
                    <ChevronRightIcon className="h-4 w-4 ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {project ? 'Updating...' : 'Submitting...'}
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-2" />
                        {project ? 'Update Request' : 'Submit Request'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}