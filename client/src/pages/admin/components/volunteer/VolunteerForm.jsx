import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCalendar, FaUsers, FaStar } from 'react-icons/fa';
import { volunteersAPI } from '../../../../services/apiService.js';
import { showToast } from '../../../../utils/toast';

const skillsOptions = [
  { value: 'technical-support', label: 'Technical Support Specialist' },
  { value: 'payment-support', label: 'Payment System Support' },
  { value: 'donation-support', label: 'Donation Management Support' },
  { value: 'beneficiary-support', label: 'Beneficiary Application Support' },
  { value: 'volunteer-support', label: 'Volunteer Application Support' },
  { value: 'mentoring', label: 'Student Mentor' },
  { value: 'developer', label: 'Web Developer' },
  { value: 'content-creation', label: 'Educational Content Creator' },
  { value: 'community-outreach', label: 'Community Outreach Coordinator' }
];

const availabilityOptions = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'evenings', label: 'Evenings' },
  { value: 'flexible', label: 'Flexible' }
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' }
];

const initialFormData = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  address: '',
  dateOfBirth: '',
  skills: [],
  availability: 'part-time',
  status: 'active',
  profileImageFile: null,
  bio: '',
  emergencyContact: {
    name: '',
    phone: '',
    relation: ''
  },
  notes: ''
};

const steps = [
  { id: 1, title: 'Personal Info', icon: FaUser },
  { id: 2, title: 'Contact Details', icon: FaPhone },
  { id: 3, title: 'Skills & Availability', icon: FaStar },
  { id: 4, title: 'Additional Info', icon: FaUsers }
];

export default function VolunteerForm({ volunteer, onSave, onClose, refreshVolunteers }) {
  const [formData, setFormData] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (volunteer) {
      const volunteerData = {
        ...volunteer,
        dateOfBirth: volunteer.dateOfBirth || '',
        skills: volunteer.skills || [],
        emergencyContact: volunteer.emergencyContact || {
          name: '',
          phone: '',
          relation: ''
        },
        notes: volunteer.notes || '',
        profileImageFile: null
      };
      setFormData(volunteerData);
      setSelectedSkills(volunteer.skills || []);
      if (volunteer.profileImage) {
        // Handle both string URL and object with url property
        const imageUrl = typeof volunteer.profileImage === 'string' 
          ? volunteer.profileImage 
          : volunteer.profileImage?.url;
        setImagePreview(imageUrl);
      }
    }
  }, [volunteer]);

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
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showToast.error('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast.error('Image size should be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        profileImageFile: file
      }));

      // Create preview
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
      profileImageFile: null
    }));
    setImagePreview('');
    // Clear file input
    const fileInput = document.getElementById('profileImageUpload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleEmergencyContactChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [name]: value
      }
    }));
  };

  const handleSkillToggle = (skillValue) => {
    setSelectedSkills(prev => {
      const newSkills = prev.includes(skillValue)
        ? prev.filter(s => s !== skillValue)
        : [...prev, skillValue];
      
      setFormData(prevData => ({
        ...prevData,
        skills: newSkills
      }));
      
      return newSkills;
    });
  };

  const validateCurrentStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    }

    if (currentStep === 2) {
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!formData.location.trim()) newErrors.location = 'Location is required';
    }

    if (currentStep === 3) {
      if (selectedSkills.length === 0) newErrors.skills = 'At least one skill is required';
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
      // Create FormData to handle file upload
      const submitFormData = new FormData();
      
      // Append all form fields
      submitFormData.append('fullName', formData.fullName);
      submitFormData.append('email', formData.email);
      submitFormData.append('phone', formData.phone);
      submitFormData.append('location', formData.location);
      submitFormData.append('address', formData.address || '');
      submitFormData.append('dateOfBirth', formData.dateOfBirth || '');
      submitFormData.append('availability', formData.availability);
      submitFormData.append('status', formData.status);
      submitFormData.append('bio', formData.bio || '');
      submitFormData.append('notes', formData.notes || '');
      
      // Append arrays and objects as JSON strings
      submitFormData.append('skills', JSON.stringify(selectedSkills));
      submitFormData.append('emergencyContact', JSON.stringify(formData.emergencyContact));
      
      // Append profile image file if exists
      if (formData.profileImageFile) {
        submitFormData.append('profileImage', formData.profileImageFile);
      }

      console.log('Submitting volunteer data:', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        skills: selectedSkills,
        hasImage: !!formData.profileImageFile
      });

      let response;
      if (volunteer) {
        // Update existing volunteer
        response = await volunteersAPI.update(volunteer._id, submitFormData);
        showToast.success('Volunteer updated successfully!');
      } else {
        // Create new volunteer
        response = await volunteersAPI.create(submitFormData);
        showToast.success('Volunteer created successfully!');
        
        // Show default password info for new volunteers
        showToast.info('Default password: Volunteer@123');
      }

      console.log('API Response:', response);

      if (refreshVolunteers) refreshVolunteers();
      onClose();

    } catch (error) {
      console.error('Error saving volunteer:', error);
      
      // Extract error message from response
      let errorMessage = 'Failed to save volunteer';
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
          ...formData,
          skills: selectedSkills,
          joinDate: volunteer ? volunteer.joinDate : new Date().toISOString().split('T')[0],
          hoursCompleted: volunteer ? volunteer.hoursCompleted : 0,
          eventsAttended: volunteer ? volunteer.eventsAttended : 0
        };

        if (onSave) onSave(submitData);
        if (refreshVolunteers) refreshVolunteers();
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
                {volunteer ? 'Edit Volunteer' : 'Add New Volunteer'}
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
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Profile Image Upload */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                        {imagePreview ? (
                          <img 
                            src={imagePreview} 
                            alt="Profile preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : volunteer?.profileImage ? (
                          <img 
                            src={typeof volunteer.profileImage === 'string' ? volunteer.profileImage : volunteer.profileImage.url} 
                            alt="Current profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <PhotoIcon className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      {(imagePreview || volunteer?.profileImage) && (
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
                        htmlFor="profileImageUpload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                      >
                        <PhotoIcon className="h-4 w-4 mr-2" />
                        {imagePreview || volunteer?.profileImage ? 'Change Photo' : 'Upload Photo'}
                      </label>
                      <input
                        id="profileImageUpload"
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                            errors.fullName ? 'border-red-500' : 'border-gray-300'
                          } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          placeholder="Enter full name"
                        />
                      </div>
                      {errors.fullName && (
                        <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          placeholder="Enter email address"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Tell us about the volunteer's background and interests..."
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Contact Details */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                            errors.phone ? 'border-red-500' : 'border-gray-300'
                          } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
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
                          placeholder="City, State"
                        />
                      </div>
                      {errors.location && (
                        <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter complete address"
                    />
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.emergencyContact.name}
                          onChange={handleEmergencyContactChange}
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Emergency contact name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.emergencyContact.phone}
                          onChange={handleEmergencyContactChange}
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Emergency contact phone"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Relation
                        </label>
                        <input
                          type="text"
                          name="relation"
                          value={formData.emergencyContact.relation}
                          onChange={handleEmergencyContactChange}
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Relation to volunteer"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Skills & Availability */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Skills & Expertise *
                    </label>
                    {errors.skills && (
                      <p className="text-sm text-red-600 mb-3">{errors.skills}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {skillsOptions.map((skill) => (
                        <label
                          key={skill.value}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                            selectedSkills.includes(skill.value)
                              ? 'bg-primary-50 border-primary-500 text-primary-700'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedSkills.includes(skill.value)}
                            onChange={() => handleSkillToggle(skill.value)}
                            disabled={isSubmitting}
                            className="hidden"
                          />
                          <div className={`w-4 h-4 border rounded mr-3 flex items-center justify-center ${
                            selectedSkills.includes(skill.value)
                              ? 'bg-primary-500 border-primary-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedSkills.includes(skill.value) && (
                              <CheckIcon className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <span className="text-sm">{skill.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Availability
                      </label>
                      <select
                        name="availability"
                        value={formData.availability}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      >
                        {availabilityOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

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
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Any additional notes or comments about the volunteer..."
                    />
                  </div>

                  {!volunteer && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">Account Information</h3>
                      <p className="text-blue-700 text-sm">
                        A user account will be automatically created with the email provided. 
                        The default password will be <strong>Volunteer@123</strong>. 
                        The volunteer can use this to login to their account.
                      </p>
                    </div>
                  )}

                  {volunteer && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Volunteer Statistics</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Hours Completed:</span> {volunteer.hoursCompleted || 0}
                        </div>
                        <div>
                          <span className="font-medium">Events Attended:</span> {volunteer.eventsAttended || 0}
                        </div>
                        <div>
                          <span className="font-medium">Join Date:</span> {new Date(volunteer.joinDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Last Active:</span> {volunteer.lastActive ? new Date(volunteer.lastActive).toLocaleDateString() : 'Never'}
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
                        {volunteer ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-2" />
                        {volunteer ? 'Update Volunteer' : 'Create Volunteer'}
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