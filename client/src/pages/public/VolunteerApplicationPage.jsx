import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  DocumentArrowUpIcon,
  TrashIcon,
  UserIcon,
  PhoneIcon,
  IdentificationIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CalendarIcon,
  MapPinIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  StarIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  LanguageIcon,
  ComputerDesktopIcon,
  HeartIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { volunteerApplicationsAPI } from '../../services/apiService';

const VolunteerApplicationPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [availableDays, setAvailableDays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  });
  
  const [availableTimes, setAvailableTimes] = useState({
    morning: false,
    afternoon: false,
    evening: false
  });
  
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      nationality: 'Indian',
      idNumber: '',
      idType: 'aadhar'
    },
    contactInfo: {
      email: '',
      phone: '',
      alternatePhone: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      }
    },
    educationInfo: {
      highestEducation: '',
      fieldOfStudy: '',
      institution: '',
      yearOfCompletion: '',
      currentlyStudying: false
    },
    professionalInfo: {
      employmentStatus: '',
      currentOccupation: '',
      company: '',
      yearsOfExperience: '',
      skills: [],
      otherSkills: ''
    },
    volunteerInfo: {
      previousVolunteerExperience: 'no',
      previousOrganization: '',
      previousRole: '',
      volunteerDuration: '',
      whyVolunteer: '',
      areasOfInterest: [],
      availability: {
        commitmentPeriod: '',
        hoursPerWeek: '',
        days: availableDays,
        times: availableTimes
      },
      referenceName: '',
      referenceContact: '',
      referenceRelationship: ''
    },
    documents: {
      resume: null,
      idProof: null,
      addressProof: null,
      otherDocuments: []
    },
    additionalInfo: {
      motivation: '',
      expectations: '',
      specialRequirements: '',
      howDidYouHear: '',
      commitment: false,
      termsAccepted: false
    }
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/signin');
      return;
    }

    // Pre-fill user data
    if (user) {
      setFormData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          firstName: user.firstName || user.name?.split(' ')[0] || user.email?.split('@')[0] || '',
          lastName: user.lastName || user.name?.split(' ')[1] || ''
        },
        contactInfo: {
          ...prev.contactInfo,
          email: user.email || '',
          phone: user.phone || user.phoneNumber || ''
        }
      }));
    }
  }, [user, isAuthenticated, navigate]);

  const handleInputChange = (section, field, value, subField = null) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: subField 
          ? { ...prev[section][field], [subField]: value }
          : value
      }
    }));
  };

  const handleArrayChange = (section, field, value, action = 'toggle') => {
    setFormData(prev => {
      const currentArray = prev[section][field] || [];
      let newArray;
      
      if (action === 'toggle') {
        if (currentArray.includes(value)) {
          newArray = currentArray.filter(item => item !== value);
        } else {
          newArray = [...currentArray, value];
        }
      } else if (action === 'add' && !currentArray.includes(value)) {
        newArray = [...currentArray, value];
      } else if (action === 'remove') {
        newArray = currentArray.filter(item => item !== value);
      }
      
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray
        }
      };
    });
  };

  const handleDayToggle = (day) => {
    setAvailableDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
    setFormData(prev => ({
      ...prev,
      volunteerInfo: {
        ...prev.volunteerInfo,
        availability: {
          ...prev.volunteerInfo.availability,
          days: {
            ...prev.volunteerInfo.availability.days,
            [day]: !prev.volunteerInfo.availability.days[day]
          }
        }
      }
    }));
  };

  const handleTimeToggle = (time) => {
    setAvailableTimes(prev => ({
      ...prev,
      [time]: !prev[time]
    }));
    setFormData(prev => ({
      ...prev,
      volunteerInfo: {
        ...prev.volunteerInfo,
        availability: {
          ...prev.volunteerInfo.availability,
          times: {
            ...prev.volunteerInfo.availability.times,
            [time]: !prev.volunteerInfo.availability.times[time]
          }
        }
      }
    }));
  };

  const handleFileChange = (documentType, file) => {
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 10 * 1024 * 1024; // 10MB for resume

      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid file (JPEG, PNG, JPG, PDF, DOC, DOCX)');
        return;
      }

      if (file.size > maxSize) {
        alert(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
        return;
      }

      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [documentType]: file
        }
      }));
    }
  };

  const handleMultipleFilesChange = (files) => {
    const validFiles = Array.from(files).filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024;
      
      if (!validTypes.includes(file.type)) {
        alert(`File ${file.name} is not a valid type (JPEG, PNG, JPG, PDF)`);
        return false;
      }
      if (file.size > maxSize) {
        alert(`File ${file.name} must be less than 5MB`);
        return false;
      }
      return true;
    });

    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        otherDocuments: [...prev.documents.otherDocuments, ...validFiles].slice(0, 5)
      }
    }));
  };

  const removeFile = (documentType, index = null) => {
    if (index !== null) {
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          otherDocuments: prev.documents.otherDocuments.filter((_, i) => i !== index)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [documentType]: null
        }
      }));
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.personalInfo.firstName?.trim() || 
            !formData.personalInfo.lastName?.trim() || 
            !formData.personalInfo.dateOfBirth || 
            !formData.personalInfo.gender) {
          alert('Please fill all required fields in Personal Information');
          return false;
        }
        break;
      case 2:
        if (!formData.contactInfo.email?.trim() || 
            !formData.contactInfo.phone?.trim() || 
            !formData.contactInfo.address.street?.trim() || 
            !formData.contactInfo.address.city?.trim() || 
            !formData.contactInfo.address.state?.trim() || 
            !formData.contactInfo.address.pincode?.trim()) {
          alert('Please fill all required fields in Contact Information');
          return false;
        }
        break;
      case 3:
        if (!formData.educationInfo.highestEducation || 
            !formData.professionalInfo.employmentStatus) {
          alert('Please fill all required fields in Education & Professional Info');
          return false;
        }
        break;
      case 4:
        if (!formData.volunteerInfo.whyVolunteer || 
            formData.volunteerInfo.areasOfInterest.length === 0 ||
            !formData.volunteerInfo.availability.commitmentPeriod ||
            !formData.volunteerInfo.availability.hoursPerWeek) {
          alert('Please fill all required fields in Volunteer Information');
          return false;
        }
        break;
      case 5:
        if (!formData.documents.resume || !formData.documents.idProof) {
          alert('Please upload required documents (Resume and ID Proof)');
          return false;
        }
        break;
      case 6:
        if (!formData.additionalInfo.motivation?.trim() || 
            !formData.additionalInfo.commitment || 
            !formData.additionalInfo.termsAccepted) {
          alert('Please fill all required fields and accept the terms');
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateStep(6)) return;
  
  setIsSubmitting(true);
  try {
    // Prepare form data for submission
    const submitData = new FormData();
    
    // Combine all form data into a single JSON string
    const formDataJson = JSON.stringify({
      personalInfo: formData.personalInfo,
      contactInfo: formData.contactInfo,
      educationInfo: formData.educationInfo,
      professionalInfo: formData.professionalInfo,
      volunteerInfo: formData.volunteerInfo,
      additionalInfo: formData.additionalInfo,
      applicationType: 'join-our-team'
    });
    
    submitData.append('data', formDataJson);
    
    // Add documents
    if (formData.documents.resume) {
      submitData.append('resume', formData.documents.resume);
    }
    if (formData.documents.idProof) {
      submitData.append('idProof', formData.documents.idProof);
    }
    if (formData.documents.addressProof) {
      submitData.append('addressProof', formData.documents.addressProof);
    }
    
    // Add other documents
    formData.documents.otherDocuments.forEach((file) => {
      submitData.append('otherDocuments', file);
    });

    console.log('Submitting volunteer application...');
    
    // Submit to backend API using the new API
    const response = await volunteerApplicationsAPI.create(submitData);
    
    console.log('Application response:', response.data);
    
    if (response.data.success) {
      alert('Application submitted successfully! We will review your application and contact you within 5-7 working days.');
      navigate('/');
    } else {
      throw new Error(response.data.message || 'Failed to submit application');
    }
  } catch (error) {
    console.error('Application error:', error);
    
    if (error.response?.status === 401) {
      alert('Your session has expired. Please login again.');
      navigate('/auth/signin');
    } else if (error.response?.status === 400) {
      alert(error.response.data.message || 'Please check your application data and try again.');
    } else if (error.response?.status === 409) {
      alert('You have already submitted a volunteer application recently.');
      navigate('/');
    } else {
      alert(error.response?.data?.message || 'An error occurred. Please try again.');
    }
  } finally {
    setIsSubmitting(false);
  }
};

  const steps = [
    { number: 1, title: 'Personal', icon: UserIcon },
    { number: 2, title: 'Contact', icon: PhoneIcon },
    { number: 3, title: 'Education', icon: AcademicCapIcon },
    { number: 4, title: 'Volunteer', icon: HeartIcon },
    { number: 5, title: 'Documents', icon: DocumentArrowUpIcon },
    { number: 6, title: 'Review', icon: CheckCircleIcon }
  ];

  // Skills options
  const skillOptions = [
    'Communication', 'Leadership', 'Teamwork', 'Problem Solving', 
    'Teaching/Tutoring', 'Event Planning', 'Fundraising', 'Social Media',
    'Graphic Design', 'Web Development', 'Photography', 'Videography',
    'Counseling', 'Medical Skills', 'First Aid', 'Translation',
    'Cooking', 'Gardening', 'Construction', 'Administrative'
  ];

  // Areas of interest options
  const interestOptions = [
    'Education', 'Healthcare', 'Environment', 'Women Empowerment',
    'Child Welfare', 'Elderly Care', 'Animal Welfare', 'Disaster Relief',
    'Community Development', 'Arts & Culture', 'Sports', 'Technology',
    'Fundraising', 'Event Management', 'Administration', 'Marketing'
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading volunteer application form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to={`/`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 font-medium transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Home
          </Link>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Join Our Volunteer Team
                </h1>
                <p className="text-gray-600 mb-3">
                  Become a volunteer and make a difference in your community
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <UserGroupIcon className="w-4 h-4 mr-1" />
                  <span>Join our growing community of volunteers</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <HeartIcon className="w-4 h-4 mr-1" />
                  <span>Make an impact through meaningful work</span>
                </div>
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-md flex items-center justify-center">
                <HeartIcon className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-8 border border-gray-100"
        >
          <div className="flex justify-between items-center relative">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center z-10">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold transition-all duration-300 ${
                  currentStep >= step.number
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                    : 'border-gray-300 text-gray-400 bg-white'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={`mt-2 text-xs font-medium transition-colors duration-300 text-center ${
                  currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
                <span className={`text-xs mt-1 ${
                  currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {step.number}
                </span>
              </div>
            ))}
            {/* Progress line */}
            <div className="absolute top-5 left-10 right-10 h-0.5 bg-gray-300 -z-10">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 mb-6"
        >
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="p-6 space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
              <p className="text-gray-600 mb-6">Tell us about yourself</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.firstName}
                    onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.lastName}
                    onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={formData.personalInfo.dateOfBirth}
                    onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    value={formData.personalInfo.gender}
                    onChange={(e) => handleInputChange('personalInfo', 'gender', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.nationality}
                    onChange={(e) => handleInputChange('personalInfo', 'nationality', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Type
                  </label>
                  <select
                    value={formData.personalInfo.idType}
                    onChange={(e) => handleInputChange('personalInfo', 'idType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                  >
                    <option value="aadhar">Aadhar Card</option>
                    <option value="voter">Voter ID</option>
                    <option value="pan">PAN Card</option>
                    <option value="passport">Passport</option>
                    <option value="driving">Driving License</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Number
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.idNumber}
                    onChange={(e) => handleInputChange('personalInfo', 'idNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                    placeholder={`Enter your ${formData.personalInfo.idType} number`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <div className="p-6 space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Contact Information</h2>
              <p className="text-gray-600 mb-6">How can we reach you?</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="email"
                      value={formData.contactInfo.email}
                      onChange={(e) => handleInputChange('contactInfo', 'email', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <PhoneIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="tel"
                      value={formData.contactInfo.phone}
                      onChange={(e) => handleInputChange('contactInfo', 'phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alternate Phone Number
                </label>
                <div className="relative">
                  <PhoneIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="tel"
                    value={formData.contactInfo.alternatePhone}
                    onChange={(e) => handleInputChange('contactInfo', 'alternatePhone', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <div className="relative">
                    <MapPinIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <textarea
                      value={formData.contactInfo.address.street}
                      onChange={(e) => handleInputChange('contactInfo', 'address', e.target.value, 'street')}
                      rows="3"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200 resize-none"
                      placeholder="Enter your complete street address"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.contactInfo.address.city}
                      onChange={(e) => handleInputChange('contactInfo', 'address', e.target.value, 'city')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={formData.contactInfo.address.state}
                      onChange={(e) => handleInputChange('contactInfo', 'address', e.target.value, 'state')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      value={formData.contactInfo.address.pincode}
                      onChange={(e) => handleInputChange('contactInfo', 'address', e.target.value, 'pincode')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Education & Professional Information */}
          {currentStep === 3 && (
            <div className="p-6 space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Education & Professional Information</h2>
              <p className="text-gray-600 mb-6">Share your educational and professional background</p>
              
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Education Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Highest Education *
                      </label>
                      <select
                        value={formData.educationInfo.highestEducation}
                        onChange={(e) => handleInputChange('educationInfo', 'highestEducation', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                        required
                      >
                        <option value="">Select Education Level</option>
                        <option value="high-school">High School</option>
                        <option value="diploma">Diploma</option>
                        <option value="bachelors">Bachelor's Degree</option>
                        <option value="masters">Master's Degree</option>
                        <option value="phd">PhD</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Field of Study
                      </label>
                      <input
                        type="text"
                        value={formData.educationInfo.fieldOfStudy}
                        onChange={(e) => handleInputChange('educationInfo', 'fieldOfStudy', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                        placeholder="e.g., Computer Science, Social Work"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Institution
                      </label>
                      <input
                        type="text"
                        value={formData.educationInfo.institution}
                        onChange={(e) => handleInputChange('educationInfo', 'institution', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                        placeholder="Name of institution"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year of Completion
                      </label>
                      <input
                        type="number"
                        value={formData.educationInfo.yearOfCompletion}
                        onChange={(e) => handleInputChange('educationInfo', 'yearOfCompletion', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                        min="1900"
                        max="2024"
                        placeholder="YYYY"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 mt-4">
                    <input
                      type="checkbox"
                      id="currentlyStudying"
                      checked={formData.educationInfo.currentlyStudying}
                      onChange={(e) => handleInputChange('educationInfo', 'currentlyStudying', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                    />
                    <label htmlFor="currentlyStudying" className="text-sm font-medium text-gray-700">
                      Currently Studying
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employment Status *
                      </label>
                      <select
                        value={formData.professionalInfo.employmentStatus}
                        onChange={(e) => handleInputChange('professionalInfo', 'employmentStatus', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                        required
                      >
                        <option value="">Select Status</option>
                        <option value="employed">Employed</option>
                        <option value="self-employed">Self-Employed</option>
                        <option value="student">Student</option>
                        <option value="unemployed">Unemployed</option>
                        <option value="retired">Retired</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Occupation
                      </label>
                      <input
                        type="text"
                        value={formData.professionalInfo.currentOccupation}
                        onChange={(e) => handleInputChange('professionalInfo', 'currentOccupation', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                        placeholder="e.g., Software Engineer, Teacher"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company/Organization
                      </label>
                      <input
                        type="text"
                        value={formData.professionalInfo.company}
                        onChange={(e) => handleInputChange('professionalInfo', 'company', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                        placeholder="Current company name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        value={formData.professionalInfo.yearsOfExperience}
                        onChange={(e) => handleInputChange('professionalInfo', 'yearsOfExperience', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                        min="0"
                        max="50"
                        placeholder="Number of years"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Skills & Expertise
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-3">
                      {skillOptions.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => handleArrayChange('professionalInfo', 'skills', skill, 'toggle')}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            formData.professionalInfo.skills.includes(skill)
                              ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Other Skills (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.professionalInfo.otherSkills}
                        onChange={(e) => handleInputChange('professionalInfo', 'otherSkills', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                        placeholder="e.g., Photography, Public Speaking, Cooking"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Add any additional skills not listed above
                      </p>
                    </div>
                    
                    {/* Selected Skills Display */}
                    {formData.professionalInfo.skills.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Selected Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.professionalInfo.skills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => handleArrayChange('professionalInfo', 'skills', skill, 'remove')}
                                className="ml-1 text-blue-500 hover:text-blue-700"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Volunteer Information */}
          {currentStep === 4 && (
            <div className="p-6 space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Volunteer Information</h2>
              <p className="text-gray-600 mb-6">Tell us about your volunteering interests and availability</p>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Previous Volunteer Experience *
                    </label>
                    <select
                      value={formData.volunteerInfo.previousVolunteerExperience}
                      onChange={(e) => handleInputChange('volunteerInfo', 'previousVolunteerExperience', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                      required
                    >
                      <option value="no">No Experience</option>
                      <option value="yes">Yes, I have experience</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Why do you want to volunteer? *
                    </label>
                    <textarea
                      value={formData.volunteerInfo.whyVolunteer}
                      onChange={(e) => handleInputChange('volunteerInfo', 'whyVolunteer', e.target.value)}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200 resize-none"
                      placeholder="Share your motivation for volunteering..."
                      required
                    />
                  </div>
                </div>

                {formData.volunteerInfo.previousVolunteerExperience === 'yes' && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Previous Volunteer Experience</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organization
                        </label>
                        <input
                          type="text"
                          value={formData.volunteerInfo.previousOrganization}
                          onChange={(e) => handleInputChange('volunteerInfo', 'previousOrganization', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                          placeholder="Organization name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <input
                          type="text"
                          value={formData.volunteerInfo.previousRole}
                          onChange={(e) => handleInputChange('volunteerInfo', 'previousRole', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                          placeholder="Your role"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={formData.volunteerInfo.volunteerDuration}
                          onChange={(e) => handleInputChange('volunteerInfo', 'volunteerDuration', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                          placeholder="e.g., 6 months, 1 year"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Areas of Interest *
                  </label>
                  <p className="text-sm text-gray-500 mb-4">Select areas you're interested in volunteering for</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {interestOptions.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleArrayChange('volunteerInfo', 'areasOfInterest', interest, 'toggle')}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          formData.volunteerInfo.areasOfInterest.includes(interest)
                            ? 'bg-green-100 text-green-700 border border-green-300'
                            : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                  
                  {formData.volunteerInfo.areasOfInterest.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Selected Interests:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.volunteerInfo.areasOfInterest.map((interest) => (
                          <span
                            key={interest}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm"
                          >
                            {interest}
                            <button
                              type="button"
                              onClick={() => handleArrayChange('volunteerInfo', 'areasOfInterest', interest, 'remove')}
                              className="ml-1 text-green-500 hover:text-green-700"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Availability</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Commitment Period *
                      </label>
                      <select
                        value={formData.volunteerInfo.availability.commitmentPeriod}
                        onChange={(e) => handleInputChange('volunteerInfo', 'availability', e.target.value, 'commitmentPeriod')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                        required
                      >
                        <option value="">Select Period</option>
                        <option value="1-3 months">1-3 months</option>
                        <option value="3-6 months">3-6 months</option>
                        <option value="6-12 months">6-12 months</option>
                        <option value="1-year-plus">1 year+</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hours per Week *
                      </label>
                      <select
                        value={formData.volunteerInfo.availability.hoursPerWeek}
                        onChange={(e) => handleInputChange('volunteerInfo', 'availability', e.target.value, 'hoursPerWeek')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                        required
                      >
                        <option value="">Select Hours</option>
                        <option value="1-5">1-5 hours</option>
                        <option value="5-10">5-10 hours</option>
                        <option value="10-20">10-20 hours</option>
                        <option value="20-plus">20+ hours</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Days
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(availableDays).map(([day, isSelected]) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDayToggle(day)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Time Slots
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(availableTimes).map(([time, isSelected]) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => handleTimeToggle(time)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isSelected
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {time.charAt(0).toUpperCase() + time.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reference Name
                    </label>
                    <input
                      type="text"
                      value={formData.volunteerInfo.referenceName}
                      onChange={(e) => handleInputChange('volunteerInfo', 'referenceName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reference Contact
                    </label>
                    <input
                      type="tel"
                      value={formData.volunteerInfo.referenceContact}
                      onChange={(e) => handleInputChange('volunteerInfo', 'referenceContact', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                      placeholder="Phone or email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={formData.volunteerInfo.referenceRelationship}
                      onChange={(e) => handleInputChange('volunteerInfo', 'referenceRelationship', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                      placeholder="e.g., Colleague, Teacher"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Documents */}
          {currentStep === 5 && (
            <div className="p-6 space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Required Documents</h2>
              <p className="text-gray-600 mb-6">Upload your resume and supporting documents</p>
              
              <div className="space-y-6">
                {/* Resume */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Resume/CV *
                  </label>
                  {!formData.documents.resume ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors duration-200">
                      <DocumentArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Upload your resume or CV</p>
                      <p className="text-sm text-gray-500 mb-4">Supported: PDF, DOC, DOCX (Max 10MB)</p>
                      <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold cursor-pointer hover:bg-blue-700 transition-colors duration-200">
                        Choose File
                        <input
                          type="file"
                          onChange={(e) => handleFileChange('resume', e.target.files[0])}
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <DocumentArrowUpIcon className="w-8 h-8 text-green-500" />
                          <div>
                            <p className="font-medium text-gray-900">{formData.documents.resume.name}</p>
                            <p className="text-sm text-gray-500">
                              {(formData.documents.resume.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('resume')}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ID Proof */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    ID Proof *
                  </label>
                  {!formData.documents.idProof ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors duration-200">
                      <IdentificationIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Upload your ID proof</p>
                      <p className="text-sm text-gray-500 mb-4">Supported: JPG, PNG, PDF (Max 5MB)</p>
                      <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold cursor-pointer hover:bg-blue-700 transition-colors duration-200">
                        Choose File
                        <input
                          type="file"
                          onChange={(e) => handleFileChange('idProof', e.target.files[0])}
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <DocumentArrowUpIcon className="w-8 h-8 text-green-500" />
                          <div>
                            <p className="font-medium text-gray-900">{formData.documents.idProof.name}</p>
                            <p className="text-sm text-gray-500">
                              {(formData.documents.idProof.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('idProof')}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Address Proof */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Address Proof
                  </label>
                  {!formData.documents.addressProof ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors duration-200">
                      <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Upload your address proof</p>
                      <p className="text-sm text-gray-500 mb-4">Supported: JPG, PNG, PDF (Max 5MB)</p>
                      <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold cursor-pointer hover:bg-blue-700 transition-colors duration-200">
                        Choose File
                        <input
                          type="file"
                          onChange={(e) => handleFileChange('addressProof', e.target.files[0])}
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <DocumentArrowUpIcon className="w-8 h-8 text-green-500" />
                          <div>
                            <p className="font-medium text-gray-900">{formData.documents.addressProof.name}</p>
                            <p className="text-sm text-gray-500">
                              {(formData.documents.addressProof.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('addressProof')}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Other Documents */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Other Supporting Documents (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors duration-200">
                    <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Upload any other supporting documents</p>
                    <p className="text-sm text-gray-500 mb-4">Supported: JPG, PNG, PDF (Max 5MB each)</p>
                    <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold cursor-pointer hover:bg-blue-700 transition-colors duration-200">
                      Choose Files
                      <input
                        type="file"
                        onChange={(e) => handleMultipleFilesChange(e.target.files)}
                        accept=".jpg,.jpeg,.png,.pdf"
                        multiple
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  {/* Display uploaded other documents */}
                  {formData.documents.otherDocuments.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {formData.documents.otherDocuments.map((file, index) => (
                        <div key={index} className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <DocumentArrowUpIcon className="w-6 h-6 text-blue-500" />
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile('otherDocuments', index)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Additional Information & Review */}
          {currentStep === 6 && (
            <div className="p-6 space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Additional Information & Review</h2>
              <p className="text-gray-600 mb-6">Tell us more and review your application</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Motivation for Volunteering *
                  </label>
                  <textarea
                    value={formData.additionalInfo.motivation}
                    onChange={(e) => handleInputChange('additionalInfo', 'motivation', e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200 resize-none"
                    placeholder="What motivates you to volunteer? What do you hope to achieve?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expectations from Volunteering
                  </label>
                  <textarea
                    value={formData.additionalInfo.expectations}
                    onChange={(e) => handleInputChange('additionalInfo', 'expectations', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200 resize-none"
                    placeholder="What do you expect to gain from this volunteering experience?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requirements or Accommodations
                  </label>
                  <textarea
                    value={formData.additionalInfo.specialRequirements}
                    onChange={(e) => handleInputChange('additionalInfo', 'specialRequirements', e.target.value)}
                    rows="2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200 resize-none"
                    placeholder="Any special needs or accommodations required"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How did you hear about this opportunity?
                  </label>
                  <select
                    value={formData.additionalInfo.howDidYouHear}
                    onChange={(e) => handleInputChange('additionalInfo', 'howDidYouHear', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                  >
                    <option value="">Select Option</option>
                    <option value="website">Our Website</option>
                    <option value="social-media">Social Media</option>
                    <option value="friend">Friend/Colleague</option>
                    <option value="volunteer-portal">Volunteer Portal</option>
                    <option value="email">Email Newsletter</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <input
                      type="checkbox"
                      id="commitment"
                      checked={formData.additionalInfo.commitment}
                      onChange={(e) => handleInputChange('additionalInfo', 'commitment', e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                      required
                    />
                    <label htmlFor="commitment" className="text-sm text-gray-600">
                      I understand that volunteering requires commitment and I agree to fulfill the responsibilities
                      as outlined. I will communicate in advance if I'm unable to meet my commitments. *
                    </label>
                  </div>

                  <div className="flex items-start space-x-3 bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <input
                      type="checkbox"
                      id="termsAccepted"
                      checked={formData.additionalInfo.termsAccepted}
                      onChange={(e) => handleInputChange('additionalInfo', 'termsAccepted', e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                      required
                    />
                    <label htmlFor="termsAccepted" className="text-sm text-blue-800">
                      I agree to the Terms & Conditions and Privacy Policy. I confirm that all information
                      provided is accurate and I give permission to contact my references if required. *
                    </label>
                  </div>
                </div>

                {/* Application Summary */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Application Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Name:</strong> {formData.personalInfo.firstName} {formData.personalInfo.lastName}</p>
                      <p><strong>Email:</strong> {formData.contactInfo.email}</p>
                      <p><strong>Education:</strong> {formData.educationInfo.highestEducation}</p>
                    </div>
                    <div>
                      <p><strong>Availability:</strong> {formData.volunteerInfo.availability.hoursPerWeek} hours/week</p>
                      <p><strong>Skills:</strong> {formData.professionalInfo.skills.length} selected</p>
                      <p><strong>Interests:</strong> {formData.volunteerInfo.areasOfInterest.length} areas</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-sm"><strong>Status:</strong> Ready for submission</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step Navigation */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-between">
              {currentStep > 1 ? (
                <motion.button
                  type="button"
                  onClick={prevStep}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-sm"
                >
                  Previous
                </motion.button>
              ) : (
                <div></div>
              )}
              
              {currentStep < 6 ? (
                <motion.button
                  type="button"
                  onClick={nextStep}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Next Step
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Volunteer Application'
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </motion.form>

        {/* Progress Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-gray-500 bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          Step {currentStep} of 6 • Your progress is saved automatically
        </motion.div>
      </div>
    </div>
  );
};

export default VolunteerApplicationPage;