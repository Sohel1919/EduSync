import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  UserCircleIcon,
  PhoneIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  HeartIcon,
  MapPinIcon,
  IdentificationIcon,
  DocumentIcon,
  LinkIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  PencilIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { volunteerApplicationsAPI } from '../../services/apiService';
import { showToast } from '../../utils/toast';

const VolunteerApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [interviewDetails, setInterviewDetails] = useState({
    date: '',
    time: '',
    mode: 'online',
    location: '',
    link: '',
    instructions: ''
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplicationDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await volunteerApplicationsAPI.getById(id);
      
      if (response.data.success) {
        setApplication(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch application');
      }
    } catch (err) {
      console.error('Error fetching application details:', err);
      setError(err.response?.data?.message || 'Failed to load application details');
      showToast.error('Failed to load application details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplicationDetails();
  }, [fetchApplicationDetails]);

  const handleStatusUpdate = async (status, notes = '', interviewData = null) => {
    try {
      setActionLoading(true);
      
      const data = { status };
      if (notes) data.notes = notes;
      if (status === 'rejected' && rejectionReason) {
        data.rejectionReason = rejectionReason;
      }
      if (status === 'interview-scheduled' && interviewData) {
        data.interviewDetails = interviewData;
      }
      
      const response = await volunteerApplicationsAPI.updateStatus(id, data);
      
      if (response.data.success) {
        setApplication(prev => ({ ...prev, status, interviewDetails: interviewData }));
        setShowInterviewModal(false);
        setShowRejectModal(false);
        setInterviewDetails({
          date: '',
          time: '',
          mode: 'online',
          location: '',
          link: '',
          instructions: ''
        });
        setRejectionReason('');
        
        showToast.success(`Application ${status} successfully`);
        
        // If approved, navigate to volunteers page
        if (status === 'approved') {
          setTimeout(() => {
            navigate('/admin/volunteers');
          }, 1500);
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
      showToast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleScheduleInterview = () => {
    if (!interviewDetails.date || !interviewDetails.time) {
      showToast.error('Please fill in date and time');
      return;
    }
    
    if (interviewDetails.mode === 'online' && !interviewDetails.link) {
      showToast.error('Please provide meeting link for online interview');
      return;
    }
    
    if (interviewDetails.mode === 'offline' && !interviewDetails.location) {
      showToast.error('Please provide location for offline interview');
      return;
    }
    
    handleStatusUpdate('interview-scheduled', '', interviewDetails);
  };

  const handleDeleteApplication = async () => {
    try {
      setActionLoading(true);
      
      const response = await volunteerApplicationsAPI.delete(id, {
        sendRejectionEmail: true,
        rejectionReason
      });
      
      if (response.data.success) {
        showToast.success('Application deleted successfully');
        navigate('/admin/volunteer-applications');
      }
    } catch (err) {
      console.error('Error deleting application:', err);
      showToast.error(err.response?.data?.message || 'Failed to delete application');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-IN')} at ${timeString || 'N/A'}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: ClockIcon },
      'under-review': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: EyeIcon },
      shortlisted: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: CheckBadgeIcon },
      'interview-scheduled': { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: CalendarIcon },
      approved: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircleIcon },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircleIcon }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {status?.replace('-', ' ')?.charAt(0)?.toUpperCase() + status?.replace('-', ' ')?.slice(1) || 'Unknown'}
      </span>
    );
  };

  const renderTabContent = () => {
    if (!application) return null;

    switch (activeTab) {
      case 'personal':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100/50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <UserCircleIcon className="w-5 h-5 mr-2 text-blue-500" />
                  Personal Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                    <p className="text-gray-900 font-medium">
                      {application.personalInfo?.firstName} {application.personalInfo?.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth</label>
                    <p className="text-gray-900 font-medium">{formatDate(application.personalInfo?.dateOfBirth)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
                    <p className="text-gray-900 font-medium capitalize">{application.personalInfo?.gender}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Nationality</label>
                    <p className="text-gray-900 font-medium">{application.personalInfo?.nationality || 'Indian'}</p>
                  </div>
                  {application.personalInfo?.idType && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Identification</label>
                      <p className="text-gray-900 font-medium">
                        {application.personalInfo?.idType?.toUpperCase()}: {application.personalInfo?.idNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100/50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPinIcon className="w-5 h-5 mr-2 text-green-500" />
                  Address Information
                </h3>
              </div>
              <div className="p-6">
                {application.contactInfo?.address && (
                  <div className="space-y-2">
                    <p className="text-gray-900 font-medium">{application.contactInfo.address.street}</p>
                    <p className="text-gray-900">
                      {application.contactInfo.address.city}, {application.contactInfo.address.state}
                    </p>
                    <p className="text-gray-900">
                      {application.contactInfo.address.pincode}, {application.contactInfo.address.country}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100/50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <AcademicCapIcon className="w-5 h-5 mr-2 text-purple-500" />
                  Education Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Highest Education</label>
                    <p className="text-gray-900 font-medium capitalize">
                      {application.educationInfo?.highestEducation?.replace('-', ' ') || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Field of Study</label>
                    <p className="text-gray-900 font-medium">{application.educationInfo?.fieldOfStudy || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Institution</label>
                    <p className="text-gray-900 font-medium">{application.educationInfo?.institution || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Year of Completion</label>
                    <p className="text-gray-900 font-medium">{application.educationInfo?.yearOfCompletion || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Currently Studying</label>
                    <p className="text-gray-900 font-medium">
                      {application.educationInfo?.currentlyStudying ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-amber-100/50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BriefcaseIcon className="w-5 h-5 mr-2 text-amber-500" />
                  Professional Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Employment Status</label>
                    <p className="text-gray-900 font-medium capitalize">
                      {application.professionalInfo?.employmentStatus?.replace('-', ' ') || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Current Occupation</label>
                    <p className="text-gray-900 font-medium">{application.professionalInfo?.currentOccupation || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Company/Organization</label>
                    <p className="text-gray-900 font-medium">{application.professionalInfo?.company || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Years of Experience</label>
                    <p className="text-gray-900 font-medium">{application.professionalInfo?.yearsOfExperience || 'N/A'}</p>
                  </div>
                </div>

                {application.professionalInfo?.skills?.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {application.professionalInfo.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full border border-blue-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {application.professionalInfo?.otherSkills && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Other Skills</label>
                    <p className="text-gray-900">{application.professionalInfo.otherSkills}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'volunteer':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-red-100/50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <HeartIcon className="w-5 h-5 mr-2 text-red-500" />
                  Volunteer Information
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Why do you want to volunteer?</label>
                    <div className="mt-1 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900 whitespace-pre-line">{application.volunteerInfo?.whyVolunteer}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Previous Volunteer Experience</label>
                      <p className="text-gray-900 font-medium capitalize">
                        {application.volunteerInfo?.previousVolunteerExperience || 'No'}
                      </p>
                    </div>
                    
                    {application.volunteerInfo?.previousVolunteerExperience === 'yes' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Previous Organization</label>
                          <p className="text-gray-900 font-medium">{application.volunteerInfo?.previousOrganization}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Previous Role</label>
                          <p className="text-gray-900 font-medium">{application.volunteerInfo?.previousRole}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Duration</label>
                          <p className="text-gray-900 font-medium">{application.volunteerInfo?.volunteerDuration}</p>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Areas of Interest</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {application.volunteerInfo?.areasOfInterest?.map((area, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full border border-green-200"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Availability</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-blue-700 font-medium">Commitment Period</p>
                        <p className="text-blue-900">{application.volunteerInfo?.availability?.commitmentPeriod}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700 font-medium">Hours per Week</p>
                        <p className="text-blue-900">{application.volunteerInfo?.availability?.hoursPerWeek}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {application.volunteerInfo?.referenceName && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-indigo-100/50">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <UserGroupIcon className="w-5 h-5 mr-2 text-indigo-500" />
                    Reference Information
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Reference Name</label>
                      <p className="text-gray-900 font-medium">{application.volunteerInfo.referenceName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Contact</label>
                      <p className="text-gray-900 font-medium">{application.volunteerInfo.referenceContact}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Relationship</label>
                      <p className="text-gray-900 font-medium">{application.volunteerInfo.referenceRelationship}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <DocumentIcon className="w-5 h-5 mr-2 text-gray-500" />
                  Application Documents
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {application.documents?.resume?.url && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <DocumentIcon className="w-5 h-5 text-blue-600 mr-2" />
                          <span className="font-medium text-blue-900">Resume/CV</span>
                        </div>
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          {(application.documents.resume.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <p className="text-sm text-blue-700 mb-3">{application.documents.resume.originalName}</p>
                      <a
                        href={application.documents.resume.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <LinkIcon className="w-4 h-4 mr-1" />
                        View Document
                      </a>
                    </div>
                  )}

                  {application.documents?.idProof?.url && (
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <IdentificationIcon className="w-5 h-5 text-green-600 mr-2" />
                          <span className="font-medium text-green-900">ID Proof</span>
                        </div>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          {(application.documents.idProof.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <p className="text-sm text-green-700 mb-3">{application.documents.idProof.originalName}</p>
                      <a
                        href={application.documents.idProof.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-green-600 hover:text-green-800 font-medium"
                      >
                        <LinkIcon className="w-4 h-4 mr-1" />
                        View Document
                      </a>
                    </div>
                  )}

                  {application.documents?.addressProof?.url && (
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <MapPinIcon className="w-5 h-5 text-purple-600 mr-2" />
                          <span className="font-medium text-purple-900">Address Proof</span>
                        </div>
                        <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                          {(application.documents.addressProof.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <p className="text-sm text-purple-700 mb-3">{application.documents.addressProof.originalName}</p>
                      <a
                        href={application.documents.addressProof.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 font-medium"
                      >
                        <LinkIcon className="w-4 h-4 mr-1" />
                        View Document
                      </a>
                    </div>
                  )}

                  {application.documents?.otherDocuments?.length > 0 && (
                    <div className="md:col-span-2">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Documents</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {application.documents.otherDocuments.map((doc, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <DocumentIcon className="w-5 h-5 text-gray-600 mr-2" />
                                <span className="font-medium text-gray-900">Document {idx + 1}</span>
                              </div>
                              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                {(doc.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-3">{doc.originalName}</p>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 font-medium"
                            >
                              <LinkIcon className="w-4 h-4 mr-1" />
                              View Document
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'additional':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-cyan-100/50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-cyan-500" />
                  Additional Information
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Motivation & Expectations</label>
                    <div className="mt-1 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900 whitespace-pre-line">{application.additionalInfo?.motivation}</p>
                    </div>
                  </div>

                  {application.additionalInfo?.expectations && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Expectations from Organization</label>
                      <p className="text-gray-900">{application.additionalInfo.expectations}</p>
                    </div>
                  )}

                  {application.additionalInfo?.specialRequirements && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Special Requirements</label>
                      <p className="text-gray-900">{application.additionalInfo.specialRequirements}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">How did you hear about us?</label>
                      <p className="text-gray-900 font-medium capitalize">
                        {application.additionalInfo?.howDidYouHear?.replace('-', ' ') || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Commitment Agreement</label>
                      <p className="text-gray-900 font-medium">
                        {application.additionalInfo?.commitment ? 'Agreed' : 'Not agreed'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Terms Accepted</label>
                      <p className="text-gray-900 font-medium">
                        {application.additionalInfo?.termsAccepted ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Not Found</h3>
            <p className="text-gray-600 mb-6">{error || 'The requested application could not be found.'}</p>
            <button
              onClick={() => navigate('/admin/volunteer-applications')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Applications
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate('/admin/volunteer-applications')}
              className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-4"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1" />
              Back to Applications
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Volunteer Application Details</h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-gray-600">
                {application.personalInfo?.firstName} {application.personalInfo?.lastName}
              </p>
              {getStatusBadge(application.status)}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              Applied on: <span className="font-medium text-gray-900">{formatDate(application.applicationDate)}</span>
            </div>
          </div>
        </div>

        {/* Application Info Bar */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500">Application ID</p>
              <p className="font-medium text-gray-900">{application._id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{application.contactInfo?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{application.contactInfo?.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Application Type</p>
              <p className="font-medium text-gray-900 capitalize">
                {application.applicationType?.replace('-', ' ') || 'General Volunteer'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden sticky top-6">
              <div className="px-4 py-5 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100/50">
                <h3 className="text-lg font-semibold text-gray-900">Navigation</h3>
              </div>
              <nav className="p-2">
                {[
                  { id: 'personal', label: 'Personal Info', icon: UserCircleIcon },
                  { id: 'education', label: 'Education & Professional', icon: AcademicCapIcon },
                  { id: 'volunteer', label: 'Volunteer Info', icon: HeartIcon },
                  { id: 'documents', label: 'Documents', icon: DocumentIcon },
                  { id: 'additional', label: 'Additional Info', icon: ChatBubbleLeftRightIcon }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg mb-1 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                {application.status !== 'approved' && application.status !== 'rejected' && (
                  <>
                    <button
                      onClick={() => setShowInterviewModal(true)}
                      disabled={actionLoading || application.status === 'interview-scheduled'}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Schedule Interview
                    </button>
                    
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={actionLoading}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      <XCircleIcon className="w-4 h-4 mr-2" />
                      Reject Application
                    </button>
                    
                    <button
                      onClick={() => handleStatusUpdate('approved', 'Application approved')}
                      disabled={actionLoading}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Approve Application
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={actionLoading}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete Application
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {renderTabContent()}

            {/* Interview Details (if scheduled) */}
            {application.interviewDetails && (
              <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-indigo-100/50">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <CalendarIcon className="w-5 h-5 mr-2 text-indigo-500" />
                    Interview Details
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Interview Date & Time</label>
                      <p className="text-gray-900 font-medium">
                        {formatDateTime(application.interviewDetails.date, application.interviewDetails.time)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Mode</label>
                      <p className="text-gray-900 font-medium capitalize">{application.interviewDetails.mode}</p>
                    </div>
                    {application.interviewDetails.mode === 'online' ? (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-500 mb-1">Meeting Link</label>
                        <a
                          href={application.interviewDetails.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                        >
                          <LinkIcon className="w-4 h-4 mr-1" />
                          {application.interviewDetails.link}
                        </a>
                      </div>
                    ) : (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                        <p className="text-gray-900 font-medium">{application.interviewDetails.location}</p>
                      </div>
                    )}
                    {application.interviewDetails.instructions && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-500 mb-1">Instructions</label>
                        <p className="text-gray-900">{application.interviewDetails.instructions}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interview Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md"
          >
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100/50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-primary-600" />
                Schedule Interview
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interview Date *</label>
                <input
                  type="date"
                  value={interviewDetails.date}
                  onChange={(e) => setInterviewDetails({...interviewDetails, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interview Time *</label>
                <input
                  type="time"
                  value={interviewDetails.time}
                  onChange={(e) => setInterviewDetails({...interviewDetails, time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interview Mode *</label>
                <select
                  value={interviewDetails.mode}
                  onChange={(e) => setInterviewDetails({...interviewDetails, mode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              
              {interviewDetails.mode === 'online' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link *</label>
                  <input
                    type="url"
                    value={interviewDetails.link}
                    onChange={(e) => setInterviewDetails({...interviewDetails, link: e.target.value})}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    value={interviewDetails.location}
                    onChange={(e) => setInterviewDetails({...interviewDetails, location: e.target.value})}
                    placeholder="Office address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowInterviewModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleInterview}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                disabled={actionLoading}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {actionLoading ? 'Scheduling...' : 'Schedule Interview'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md"
          >
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-red-50 to-red-100/50">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Reject Application</h3>
                  <p className="text-sm text-gray-500">
                    Are you sure you want to reject this application?
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for rejection (optional)
                </label>
                <textarea
                  id="rejectionReason"
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate('rejected', 'Application rejected')}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <XCircleIcon className="w-4 h-4 mr-2" />
                {actionLoading ? 'Rejecting...' : 'Reject Application'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md"
          >
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-red-50 to-red-100/50">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Delete Application</h3>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone. All application data will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-600 font-medium">
                  Warning: This action cannot be undone. All application data and documents will be permanently deleted.
                </p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="deleteReason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for deletion (optional)
                </label>
                <textarea
                  id="deleteReason"
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Reason for deletion..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteApplication}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                {actionLoading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VolunteerApplicationDetails;