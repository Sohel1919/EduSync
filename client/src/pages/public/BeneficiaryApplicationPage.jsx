import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  DocumentArrowUpIcon,
  TrashIcon,
  UserIcon,
  PhoneIcon,
  IdentificationIcon,
  BanknotesIcon,
  UserGroupIcon,
  EnvelopeIcon,
  MapPinIcon,
  HeartIcon,
  HomeIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { projectsAPI, beneficiariesAPI } from '../../services/apiService';

const BeneficiaryApplicationPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      maritalStatus: '',
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
    familyBackground: {
      familySize: '',
      numberOfDependents: '',
      monthlyIncome: '',
      incomeSource: '',
      housingType: '',
      hasDisability: false,
      disabilityType: ''
    },
    applicationDetails: {
      previousApplications: 'no',
      expectedSupport: '',
      howDidYouHear: '',
      referralSource: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      }
    },
    documents: {
      idProof: null,
      addressProof: null,
      incomeProof: null,
      medicalProof: null,
      otherDocuments: []
    },
    additionalInfo: {
      story: '',
      challenges: '',
      futurePlans: '',
      howProjectWillHelp: '',
      commitment: false
    }
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/signin');
      return;
    }

    const fetchProject = async () => {
      setIsLoading(true);
      try {
        const response = await projectsAPI.getById(projectId);
        const projectData = response.data;
        
        if (!projectData) {
          navigate('/projects');
          return;
        }
        setProject(projectData);
      } catch (error) {
        console.error('Error fetching project:', error);
        navigate('/projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();

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
  }, [projectId, user, isAuthenticated, navigate]);

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

  const handleFileChange = (documentType, file) => {
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024;

      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid file (JPEG, PNG, JPG, PDF)');
        return;
      }

      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
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
            !formData.personalInfo.gender || 
            !formData.personalInfo.maritalStatus || 
            !formData.personalInfo.idNumber?.trim()) {
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
        if (!formData.familyBackground.familySize || 
            !formData.familyBackground.numberOfDependents || 
            !formData.familyBackground.monthlyIncome || 
            !formData.familyBackground.incomeSource || 
            !formData.familyBackground.housingType) {
          alert('Please fill all required fields in Family Background');
          return false;
        }
        break;
      case 4:
        if (!formData.applicationDetails.expectedSupport || 
            !formData.applicationDetails.howDidYouHear ||
            !formData.applicationDetails.emergencyContact.name?.trim() || 
            !formData.applicationDetails.emergencyContact.relationship?.trim() ||
            !formData.applicationDetails.emergencyContact.phone?.trim()) {
          alert('Please fill all required fields in Application Details');
          return false;
        }
        break;
      case 5:
        const requiredDocuments = ['idProof', 'addressProof', 'incomeProof'];
        const missingDocuments = requiredDocuments.filter(docType => {
          const file = formData.documents[docType];
          return !file || !file.name || !file.size;
        });

        if (missingDocuments.length > 0) {
          const documentNames = {
            idProof: 'ID Proof',
            addressProof: 'Address Proof', 
            incomeProof: 'Income Proof'
          };
          const missingNames = missingDocuments.map(doc => documentNames[doc]).join(', ');
          alert(`Please upload all required documents: ${missingNames}`);
          return false;
        }
        break;
      case 6:
        if (!formData.additionalInfo.story?.trim() || 
            !formData.additionalInfo.challenges?.trim() || 
            !formData.additionalInfo.howProjectWillHelp?.trim() || 
            !formData.additionalInfo.commitment) {
          alert('Please fill all required fields and agree to the commitment');
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
      
      // Add project information
      submitData.append('projectId', project?._id || projectId);
      submitData.append('projectTitle', project?.title || '');
      
      // Add personal information
      submitData.append('personalInfo', JSON.stringify(formData.personalInfo));
      
      // Add contact information
      submitData.append('contactInfo', JSON.stringify(formData.contactInfo));
      
      // Add family background
      submitData.append('familyBackground', JSON.stringify(formData.familyBackground));
      
      // Add application details
      submitData.append('applicationDetails', JSON.stringify(formData.applicationDetails));
      
      // Add additional information
      submitData.append('additionalInfo', JSON.stringify(formData.additionalInfo));
      
      // Add documents
      if (formData.documents.idProof) {
        submitData.append('idProof', formData.documents.idProof);
      }
      if (formData.documents.addressProof) {
        submitData.append('addressProof', formData.documents.addressProof);
      }
      if (formData.documents.incomeProof) {
        submitData.append('incomeProof', formData.documents.incomeProof);
      }
      if (formData.documents.medicalProof) {
        submitData.append('medicalProof', formData.documents.medicalProof);
      }
      
      // Add other documents
      formData.documents.otherDocuments.forEach((file, index) => {
        submitData.append(`otherDocuments`, file);
      });

      // Submit to backend API
      const response = await beneficiariesAPI.create(submitData);
      
      if (response.data.success) {
        alert('Application submitted successfully! We will review your application and contact you within 5-7 working days.');
        navigate('/projects');
      } else {
        throw new Error(response.data.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Application error:', error);
      alert(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Personal', icon: UserIcon },
    { number: 2, title: 'Contact', icon: PhoneIcon },
    { number: 3, title: 'Family', icon: UserGroupIcon },
    { number: 4, title: 'Application', icon: DocumentArrowUpIcon },
    { number: 5, title: 'Documents', icon: IdentificationIcon },
    { number: 6, title: 'Review', icon: BanknotesIcon }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application form...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The project you're trying to apply for doesn't exist.</p>
          <Link
            to="/projects"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  // Get project image safely
  const projectImage = project.images && project.images.length > 0 
    ? project.images[0] 
    : 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';

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
            to={`/projects`}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 font-medium transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Projects
          </Link>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Apply as Beneficiary
                </h1>
                <p className="text-gray-600 mb-3">
                  Complete this form to apply for support from <strong className="text-primary-600">{project.title}</strong>
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <UserGroupIcon className="w-4 h-4 mr-1" />
                  <span>{project.beneficiaries || 0} people already benefiting</span>
                </div>
                {project.organization && (
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <BuildingStorefrontIcon className="w-4 h-4 mr-1" />
                    <span>by {project.organization}</span>
                  </div>
                )}
              </div>
              <img
                src={projectImage}
                alt={project.title}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shadow-md"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
                }}
              />
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
                    ? 'bg-primary-600 border-primary-600 text-white shadow-md'
                    : 'border-gray-300 text-gray-400 bg-white'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={`mt-2 text-xs font-medium transition-colors duration-300 text-center ${
                  currentStep >= step.number ? 'text-primary-600' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
                <span className={`text-xs mt-1 ${
                  currentStep >= step.number ? 'text-primary-600' : 'text-gray-400'
                }`}>
                  {step.number}
                </span>
              </div>
            ))}
            {/* Progress line */}
            <div className="absolute top-5 left-10 right-10 h-0.5 bg-gray-300 -z-10">
              <div 
                className="h-full bg-primary-600 transition-all duration-300"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
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
                    Marital Status *
                  </label>
                  <select
                    value={formData.personalInfo.maritalStatus}
                    onChange={(e) => handleInputChange('personalInfo', 'maritalStatus', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nationality *
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.nationality}
                    onChange={(e) => handleInputChange('personalInfo', 'nationality', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Type *
                  </label>
                  <select
                    value={formData.personalInfo.idType}
                    onChange={(e) => handleInputChange('personalInfo', 'idType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
                    required
                  >
                    <option value="aadhar">Aadhar Card</option>
                    <option value="voter">Voter ID</option>
                    <option value="pan">PAN Card</option>
                    <option value="passport">Passport</option>
                    <option value="driving">Driving License</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.personalInfo.idType === 'aadhar' ? 'Aadhar Number' :
                   formData.personalInfo.idType === 'pan' ? 'PAN Number' :
                   formData.personalInfo.idType === 'voter' ? 'Voter ID Number' :
                   formData.personalInfo.idType === 'passport' ? 'Passport Number' : 'License Number'} *
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.idNumber}
                  onChange={(e) => handleInputChange('personalInfo', 'idNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
                  placeholder={`Enter your ${formData.personalInfo.idType} number`}
                  required
                />
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200 resize-none"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Family Background */}
          {currentStep === 3 && (
            <div className="p-6 space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Family Background</h2>
              <p className="text-gray-600 mb-6">Tell us about your family situation</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Family Size *
                  </label>
                  <input
                    type="number"
                    value={formData.familyBackground.familySize}
                    onChange={(e) => handleInputChange('familyBackground', 'familySize', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
                    min="1"
                    max="20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Dependents *
                  </label>
                  <input
                    type="number"
                    value={formData.familyBackground.numberOfDependents}
                    onChange={(e) => handleInputChange('familyBackground', 'numberOfDependents', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
                    min="0"
                    max="15"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Income (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.familyBackground.monthlyIncome}
                    onChange={(e) => handleInputChange('familyBackground', 'monthlyIncome', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
                    min="0"
                    step="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Income Source *
                  </label>
                  <select
                    value={formData.familyBackground.incomeSource}
                    onChange={(e) => handleInputChange('familyBackground', 'incomeSource', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
                    required
                  >
                    <option value="">Select Source</option>
                    <option value="employment">Employment</option>
                    <option value="business">Business</option>
                    <option value="agriculture">Agriculture</option>
                    <option value="daily-wage">Daily Wage</option>
                    <option value="pension">Pension</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Housing Type *
                  </label>
                  <select
                    value={formData.familyBackground.housingType}
                    onChange={(e) => handleInputChange('familyBackground', 'housingType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="own-house">Own House</option>
                    <option value="rented">Rented</option>
                    <option value="family-house">Family House</option>
                    <option value="temporary">Temporary Shelter</option>
                  </select>
                </div>
                <div className="flex items-center space-x-4 p-3 border border-gray-300 rounded-xl">
                  <input
                    type="checkbox"
                    id="hasDisability"
                    checked={formData.familyBackground.hasDisability}
                    onChange={(e) => handleInputChange('familyBackground', 'hasDisability', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-600"
                  />
                  <label htmlFor="hasDisability" className="text-sm font-medium text-gray-700">
                    Do you have any disability?
                  </label>
                </div>
              </div>

              {formData.familyBackground.hasDisability && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disability Type
                  </label>
                  <input
                    type="text"
                    value={formData.familyBackground.disabilityType}
                    onChange={(e) => handleInputChange('familyBackground', 'disabilityType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Describe your disability"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 4: Application Details */}
          {currentStep === 4 && (
            <div className="p-6 space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Application Details</h2>
              <p className="text-gray-600 mb-6">Tell us about your needs and situation</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Have you applied for similar support before? *
                  </label>
                  <select
                    value={formData.applicationDetails.previousApplications}
                    onChange={(e) => handleInputChange('applicationDetails', 'previousApplications', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
                    required
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Support Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.applicationDetails.expectedSupport}
                    onChange={(e) => handleInputChange('applicationDetails', 'expectedSupport', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
                    min="0"
                    step="100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How did you hear about us? *
                  </label>
                  <select
                    value={formData.applicationDetails.howDidYouHear}
                    onChange={(e) => handleInputChange('applicationDetails', 'howDidYouHear', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
                    required
                  >
                    <option value="">Select Option</option>
                    <option value="friend">Friend/Family</option>
                    <option value="social-media">Social Media</option>
                    <option value="newspaper">Newspaper</option>
                    <option value="ngo">NGO Partner</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referral Source
                  </label>
                  <input
                    type="text"
                    value={formData.applicationDetails.referralSource}
                    onChange={(e) => handleInputChange('applicationDetails', 'referralSource', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="If referred by someone"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.applicationDetails.emergencyContact.name}
                      onChange={(e) => handleInputChange('applicationDetails', 'emergencyContact', e.target.value, 'name')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relationship *
                    </label>
                    <input
                      type="text"
                      value={formData.applicationDetails.emergencyContact.relationship}
                      onChange={(e) => handleInputChange('applicationDetails', 'emergencyContact', e.target.value, 'relationship')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.applicationDetails.emergencyContact.phone}
                      onChange={(e) => handleInputChange('applicationDetails', 'emergencyContact', e.target.value, 'phone')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200"
                      required
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
              <p className="text-gray-600 mb-6">Upload the necessary documents for verification</p>
              
              <div className="space-y-6">
                {/* ID Proof */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    ID Proof ({formData.personalInfo.idType}) *
                  </label>
                  {!formData.documents.idProof ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors duration-200">
                      <DocumentArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Upload your {formData.personalInfo.idType} document</p>
                      <p className="text-sm text-gray-500 mb-4">Supported: JPG, PNG, PDF (Max 5MB)</p>
                      <label className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold cursor-pointer hover:bg-primary-700 transition-colors duration-200">
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
                    Address Proof *
                  </label>
                  {!formData.documents.addressProof ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors duration-200">
                      <HomeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Upload your address proof document</p>
                      <p className="text-sm text-gray-500 mb-4">Supported: JPG, PNG, PDF (Max 5MB)</p>
                      <label className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold cursor-pointer hover:bg-primary-700 transition-colors duration-200">
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

                {/* Income Proof */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Income Proof *
                  </label>
                  {!formData.documents.incomeProof ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors duration-200">
                      <BanknotesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Upload your income proof document</p>
                      <p className="text-sm text-gray-500 mb-4">Supported: JPG, PNG, PDF (Max 5MB)</p>
                      <label className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold cursor-pointer hover:bg-primary-700 transition-colors duration-200">
                        Choose File
                        <input
                          type="file"
                          onChange={(e) => handleFileChange('incomeProof', e.target.files[0])}
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
                            <p className="font-medium text-gray-900">{formData.documents.incomeProof.name}</p>
                            <p className="text-sm text-gray-500">
                              {(formData.documents.incomeProof.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('incomeProof')}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Medical Proof (Conditional) */}
                {formData.familyBackground.hasDisability && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Medical Proof (Disability Certificate)
                    </label>
                    {!formData.documents.medicalProof ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors duration-200">
                        <HeartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Upload your medical proof document</p>
                        <p className="text-sm text-gray-500 mb-4">Supported: JPG, PNG, PDF (Max 5MB)</p>
                        <label className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold cursor-pointer hover:bg-primary-700 transition-colors duration-200">
                          Choose File
                          <input
                            type="file"
                            onChange={(e) => handleFileChange('medicalProof', e.target.files[0])}
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
                              <p className="font-medium text-gray-900">{formData.documents.medicalProof.name}</p>
                              <p className="text-sm text-gray-500">
                                {(formData.documents.medicalProof.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile('medicalProof')}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Other Documents */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Other Supporting Documents (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors duration-200">
                    <BuildingStorefrontIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Upload any other supporting documents</p>
                    <p className="text-sm text-gray-500 mb-4">Supported: JPG, PNG, PDF (Max 5MB each)</p>
                    <label className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold cursor-pointer hover:bg-primary-700 transition-colors duration-200">
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
              <p className="text-gray-600 mb-6">Tell us your story and review your application</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Story *
                  </label>
                  <textarea
                    value={formData.additionalInfo.story}
                    onChange={(e) => handleInputChange('additionalInfo', 'story', e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200 resize-none"
                    placeholder="Tell us about yourself, your background, and why you need support..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Challenges *
                  </label>
                  <textarea
                    value={formData.additionalInfo.challenges}
                    onChange={(e) => handleInputChange('additionalInfo', 'challenges', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200 resize-none"
                    placeholder="Describe the challenges you are currently facing..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Future Plans
                  </label>
                  <textarea
                    value={formData.additionalInfo.futurePlans}
                    onChange={(e) => handleInputChange('additionalInfo', 'futurePlans', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200 resize-none"
                    placeholder="What are your plans for the future if you receive support?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How will this project help you? *
                  </label>
                  <textarea
                    value={formData.additionalInfo.howProjectWillHelp}
                    onChange={(e) => handleInputChange('additionalInfo', 'howProjectWillHelp', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all duration-200 resize-none"
                    placeholder="Explain how this project will specifically help your situation..."
                    required
                  />
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="commitment"
                      checked={formData.additionalInfo.commitment}
                      onChange={(e) => handleInputChange('additionalInfo', 'commitment', e.target.checked)}
                      className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-600"
                      required
                    />
                    <label htmlFor="commitment" className="text-sm text-gray-600">
                      I confirm that all information provided is true and accurate to the best of my knowledge. 
                      I understand that any false information may lead to rejection of my application and 
                      I commit to using the support for the intended purpose only. *
                    </label>
                  </div>
                </div>

                {/* Application Summary */}
                <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
                  <h3 className="text-lg font-semibold text-primary-900 mb-3">Application Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Name:</strong> {formData.personalInfo.firstName} {formData.personalInfo.lastName}</p>
                      <p><strong>Email:</strong> {formData.contactInfo.email}</p>
                      <p><strong>Phone:</strong> {formData.contactInfo.phone}</p>
                    </div>
                    <div>
                      <p><strong>Family Size:</strong> {formData.familyBackground.familySize}</p>
                      <p><strong>Monthly Income:</strong> ₹{formData.familyBackground.monthlyIncome}</p>
                      <p><strong>Expected Support:</strong> ₹{formData.applicationDetails.expectedSupport}</p>
                    </div>
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
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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
                    'Submit Application'
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

export default BeneficiaryApplicationPage;