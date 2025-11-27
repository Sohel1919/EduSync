import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { FaUser, FaMapMarkerAlt, FaCalendar, FaUsers, FaBuilding, FaBullseye } from 'react-icons/fa';
import { projectRequestsAPI } from '../../../services/apiService.js';
import { showToast } from '../../../utils/toast';

const categories = [
  { value: 'education', label: 'Education' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'empowerment', label: 'Empowerment' },
  { value: 'environment', label: 'Environment' },
  { value: 'disaster-relief', label: 'Disaster Relief' },
  { value: 'animal-welfare', label: 'Animal Welfare' },
  { value: 'elderly-care', label: 'Elderly Care' },
  { value: 'child-development', label: 'Child Development' }
];

const tagsOptions = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'community', label: 'Community' },
  { value: 'sustainable', label: 'Sustainable' },
  { value: 'innovative', label: 'Innovative' },
  { value: 'grassroots', label: 'Grassroots' },
  { value: 'education', label: 'Education' },
  { value: 'health', label: 'Health' },
  { value: 'environment', label: 'Environment' }
];

const initialFormData = {
  title: '',
  summary: '',
  description: '',
  category: 'education',
  targetAmount: '',
  deadline: '',
  beneficiaries: '',
  organization: '',
  location: '',
  tags: [],
  projectImageFile: null
};

const steps = [
  { id: 1, title: 'Basic Info', icon: FaUser },
  { id: 2, title: 'Project Details', icon: FaBullseye },
  { id: 3, title: 'Organization', icon: FaBuilding },
  { id: 4, title: 'Additional Info', icon: FaUsers }
];

export default function VolunteerProjectForm({ project, onSave, onClose, refreshProjects }) {
  const [formData, setFormData] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (project) {
      const projectData = {
        ...project,
        targetAmount: project.targetAmount?.toString() || '',
        beneficiaries: project.beneficiaries?.toString() || '',
        deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
        tags: project.tags || [],
        projectImageFile: null
      };
      setFormData(projectData);
      setSelectedTags(project.tags || []);
      if (project.projectImage) {
        const imageUrl = typeof project.projectImage === 'string' 
          ? project.projectImage 
          : project.projectImage?.url;
        setImagePreview(imageUrl);
      }
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showToast.error('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showToast.error('Image size should be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        projectImageFile: file
      }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      projectImageFile: null
    }));
    setImagePreview('');
    const fileInput = document.getElementById('projectImageUpload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleTagToggle = (tagValue) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(tagValue)
        ? prev.filter(t => t !== tagValue)
        : [...prev, tagValue];
      
      setFormData(prevData => ({
        ...prevData,
        tags: newTags
      }));
      
      return newTags;
    });
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
      // Create FormData for file upload
      const submitFormData = new FormData();
      
      // Append all form fields
      submitFormData.append('title', formData.title.trim());
      submitFormData.append('summary', formData.summary.trim());
      submitFormData.append('description', formData.description.trim());
      submitFormData.append('category', formData.category);
      submitFormData.append('targetAmount', formData.targetAmount);
      submitFormData.append('deadline', formData.deadline);
      submitFormData.append('beneficiaries', formData.beneficiaries);
      submitFormData.append('organization', formData.organization.trim());
      submitFormData.append('location', formData.location.trim());
      submitFormData.append('tags', JSON.stringify(selectedTags));
      
      // Append project image file if exists
      if (formData.projectImageFile) {
        submitFormData.append('projectImage', formData.projectImageFile);
      }

      console.log('Submitting project request data:', {
        title: formData.title,
        category: formData.category,
        targetAmount: formData.targetAmount,
        hasImage: !!formData.projectImageFile
      });

      let response;
      if (project) {
        // Update existing project request
        response = await projectRequestsAPI.update(project._id, submitFormData);
        showToast.success('Project request updated successfully!');
      } else {
        // Create new project request
        response = await projectRequestsAPI.create(submitFormData);
        showToast.success('Project request submitted successfully and waiting for approval!');
      }

      console.log('API Response:', response);

      if (refreshProjects) refreshProjects();
      onClose();

    } catch (error) {
      console.error('Error saving project request:', error);
      
      // Extract error message from response
      let errorMessage = project ? 'Failed to update project request' : 'Failed to create project request';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast.error(errorMessage);
      
      // For demo fallback (only if API is completely unavailable)
      if (error.response?.status === 0 || error.code === 'NETWORK_ERROR') {
        showToast.info('Using demo mode - Backend not connected');
        const submitData = {
          title: formData.title.trim(),
          summary: formData.summary.trim(),
          description: formData.description.trim(),
          category: formData.category,
          targetAmount: parseFloat(formData.targetAmount),
          beneficiaries: parseInt(formData.beneficiaries),
          deadline: new Date(formData.deadline).toISOString(),
          organization: formData.organization.trim(),
          location: formData.location.trim(),
          tags: selectedTags,
          _id: project?._id || `project-${Date.now()}`,
          currentAmount: project?.currentAmount || 0,
          progress: project?.progress || 0,
          donors: project?.donors || 0,
          isApproved: project?.isApproved || 'pending',
          createdAt: project?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        if (onSave) onSave(submitData);
        if (refreshProjects) refreshProjects();
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  {/* Project Image Upload */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                        {imagePreview ? (
                          <img 
                            src={imagePreview} 
                            alt="Project preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : project?.projectImage ? (
                          <img 
                            src={typeof project.projectImage === 'string' ? project.projectImage : project.projectImage.url} 
                            alt="Current project" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <PhotoIcon className="h-12 w-12 text-gray-400" />
                        )}
                      </div>
                      {(imagePreview || project?.projectImage) && (
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="mt-4 text-center">
                      <label
                        htmlFor="projectImageUpload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                      >
                        <PhotoIcon className="h-4 w-4 mr-2" />
                        {imagePreview || project?.projectImage ? 'Change Image' : 'Upload Project Image'}
                      </label>
                      <input
                        id="projectImageUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isSubmitting}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        JPG, PNG, GIF, WebP. Max 5MB.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Title *
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                          errors.title ? 'border-red-500' : 'border-gray-300'
                        } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        placeholder="Enter project title"
                      />
                    </div>
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Amount (₹) *
                      </label>
                      <div className="relative">
                        <FaBullseye className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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

              {/* Step 3: Organization Details */}
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

              {/* Step 4: Additional Information */}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Project Tags
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {tagsOptions.map((tag) => (
                        <label
                          key={tag.value}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                            selectedTags.includes(tag.value)
                              ? 'bg-primary-50 border-primary-500 text-primary-700'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedTags.includes(tag.value)}
                            onChange={() => handleTagToggle(tag.value)}
                            disabled={isSubmitting}
                            className="hidden"
                          />
                          <div className={`w-4 h-4 border rounded mr-3 flex items-center justify-center ${
                            selectedTags.includes(tag.value)
                              ? 'bg-primary-500 border-primary-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedTags.includes(tag.value) && (
                              <CheckIcon className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <span className="text-sm">{tag.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {!project && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">Approval Process</h3>
                      <p className="text-blue-700 text-sm">
                        Your project request will be submitted for admin approval. 
                        You will be notified once it's reviewed. 
                        Project requests typically take 24-48 hours to be approved.
                      </p>
                    </div>
                  )}

                  {project && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Statistics</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Current Amount:</span> ₹{project.currentAmount || 0}
                        </div>
                        <div>
                          <span className="font-medium">Progress:</span> {project.progress || 0}%
                        </div>
                        <div>
                          <span className="font-medium">Donors:</span> {project.donors || 0}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span> 
                          <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                            project.isApproved === 'approved' ? 'bg-green-100 text-green-800' :
                            project.isApproved === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {project.isApproved || 'pending'}
                          </span>
                        </div>
                      </div>
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