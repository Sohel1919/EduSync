import VolunteerApplication from '../models/volunteerApplication.model.js';
import User from '../models/user.model.js';
import Volunteer from '../models/volunteer.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import mongoose from 'mongoose';
import {
  sendApplicationSubmittedEmail,
  sendInterviewScheduledEmail,
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
  sendApplicationDeletedEmail
} from '../services/volunteerApplicationEmailService.js';

// Helper function to handle file uploads
const uploadDocument = async (file, folder = 'volunteer-documents') => {
  if (!file) return null;
  
  try {
    const result = await uploadToCloudinary(file.buffer, folder);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      originalName: file.originalname,
      size: file.size
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    throw new Error(`Failed to upload ${file.originalname}`);
  }
};

// Create new volunteer application
export const createVolunteerApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user already has a pending application
    const existingApplication = await VolunteerApplication.findOne({
      user: userId,
      status: { $in: ['pending', 'under-review', 'shortlisted'] }
    });
    
    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: 'You already have a volunteer application in progress'
      });
    }
    
    // Parse form data
    const {
      personalInfo,
      contactInfo,
      educationInfo,
      professionalInfo,
      volunteerInfo,
      additionalInfo,
      appliedAs = 'volunteer',
      applicationType = 'join-our-team',
      projectId,
      projectTitle
    } = JSON.parse(req.body.data || '{}');
    
    // Upload documents
    const documents = {
      resume: null,
      idProof: null,
      addressProof: null,
      otherDocuments: []
    };
    
    if (req.files?.resume?.[0]) {
      documents.resume = await uploadDocument(req.files.resume[0], 'volunteer-resumes');
    }
    
    if (req.files?.idProof?.[0]) {
      documents.idProof = await uploadDocument(req.files.idProof[0], 'volunteer-id-proofs');
    }
    
    if (req.files?.addressProof?.[0]) {
      documents.addressProof = await uploadDocument(req.files.addressProof[0], 'volunteer-address-proofs');
    }
    
    if (req.files?.otherDocuments) {
      for (const file of req.files.otherDocuments) {
        const uploadedDoc = await uploadDocument(file, 'volunteer-other-documents');
        documents.otherDocuments.push(uploadedDoc);
      }
    }
    
    // Validate required documents
    if (!documents.resume || !documents.idProof) {
      return res.status(400).json({
        success: false,
        message: 'Resume and ID proof are required'
      });
    }
    
    // Create application
    const application = new VolunteerApplication({
      user: userId,
      applicationType,
      project: projectId || null,
      projectTitle: projectTitle || null,
      personalInfo,
      contactInfo,
      educationInfo,
      professionalInfo,
      volunteerInfo,
      additionalInfo,
      documents
    });
    
    await application.save();
    
    // Send confirmation email
    await sendApplicationSubmittedEmail(application);
    
    res.status(201).json({
      success: true,
      message: 'Volunteer application submitted successfully',
      data: {
        applicationId: application._id,
        status: application.status,
        applicationDate: application.applicationDate
      }
    });
    
  } catch (error) {
    console.error('Error creating volunteer application:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit application'
    });
  }
};

// Get all volunteer applications (Admin only)
export const getAllVolunteerApplications = async (req, res) => {
  try {
    const {
      status,
      applicationType,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10,
      sortBy = 'applicationDate',
      sortOrder = 'desc'
    } = req.query;
    
    const query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Filter by application type
    if (applicationType) {
      query.applicationType = applicationType;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.applicationDate = {};
      if (startDate) query.applicationDate.$gte = new Date(startDate);
      if (endDate) query.applicationDate.$lte = new Date(endDate);
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { 'contactInfo.email': { $regex: search, $options: 'i' } },
        { 'contactInfo.phone': { $regex: search, $options: 'i' } },
        { 'personalInfo.idNumber': { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const applications = await VolunteerApplication.find(query)
      .populate('user', 'name email phone profileImage')
      .populate('reviewedBy', 'name email')
      .populate('project', 'title organization')
      .populate('interviewDetails.scheduledBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Calculate total
    const total = await VolunteerApplication.countDocuments(query);
    
    // Get unique statuses for filtering
    const statusCounts = await VolunteerApplication.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      filters: {
        statusCounts
      }
    });
    
  } catch (error) {
    console.error('Error fetching volunteer applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
};

// Get single volunteer application
export const getVolunteerApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID'
      });
    }
    
    const application = await VolunteerApplication.findById(id)
      .populate('user', 'name email phone profileImage')
      .populate('reviewedBy', 'name email')
      .populate('project', 'title organization')
      .populate('interviewDetails.scheduledBy', 'name email');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Check if user is authorized to view this application
    if (req.user.role !== 'admin' && application.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.status(200).json({
      success: true,
      data: application
    });
    
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application'
    });
  }
};

// Get applications for logged-in user
export const getMyVolunteerApplications = async (req, res) => {
  try {
    const applications = await VolunteerApplication.find({ user: req.user.id })
      .populate('project', 'title organization')
      .sort({ applicationDate: -1 });
    
    res.status(200).json({
      success: true,
      data: applications
    });
    
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
};

// Update application status (Admin only) - NO VALIDATION WHEN APPROVING
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, notes, interviewDetails } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID'
      });
    }
    
    const application = await VolunteerApplication.findById(id)
      .populate('user', 'name email phone profileImage');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Validate status transition
    const validStatuses = ['pending', 'under-review', 'shortlisted', 'interview-scheduled', 'approved', 'rejected', 'on-hold'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    // Get admin user info
    const adminUser = await User.findById(req.user.id);
    const adminName = adminUser?.name || 'Admin Team';
    
    // Update application
    application.status = status;
    application.reviewedBy = req.user.id;
    application.reviewDate = new Date();
    
    if (status === 'rejected' && rejectionReason) {
      application.rejectionReason = rejectionReason;
    }
    
    if (notes) {
      application.notes = notes;
    }
    
    if (status === 'interview-scheduled' && interviewDetails) {
      application.interviewDetails = {
        ...interviewDetails,
        scheduledBy: req.user.id,
        scheduledAt: new Date(),
        status: 'scheduled'
      };
      
      // Send interview scheduled email
      await sendInterviewScheduledEmail(application, interviewDetails, adminName);
    }
    
    if (status === 'approved') {
  // Send approval email only
  await sendApplicationApprovedEmail(application, adminName);
}
    
    if (status === 'rejected') {
      // Send rejection email
      await sendApplicationRejectedEmail(application, adminName, rejectionReason);
    }
    
    await application.save();
    
    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      data: application
    });
    
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update application status',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update interview details
export const updateInterviewDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const interviewDetails = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID'
      });
    }
    
    const application = await VolunteerApplication.findById(id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Get admin user info
    const adminUser = await User.findById(req.user.id);
    const adminName = adminUser?.name || 'Admin Team';
    
    application.interviewDetails = {
      ...interviewDetails,
      scheduledBy: req.user.id,
      scheduledAt: new Date(),
      status: interviewDetails.status || 'scheduled'
    };
    
    application.status = 'interview-scheduled';
    application.reviewedBy = req.user.id;
    application.reviewDate = new Date();
    
    await application.save();
    
    // Send interview scheduled/updated email
    await sendInterviewScheduledEmail(application, interviewDetails, adminName);
    
    res.status(200).json({
      success: true,
      message: 'Interview details updated successfully',
      data: application
    });
    
  } catch (error) {
    console.error('Error updating interview details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update interview details'
    });
  }
};

// Add note to application (Admin only)
export const addApplicationNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID'
      });
    }
    
    if (!note || note.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Note is required'
      });
    }
    
    const application = await VolunteerApplication.findById(id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    application.notes = application.notes 
      ? `${application.notes}\n\n${new Date().toLocaleString()}: ${note}`
      : `${new Date().toLocaleString()}: ${note}`;
    
    await application.save();
    
    res.status(200).json({
      success: true,
      message: 'Note added successfully',
      data: application
    });
    
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note'
    });
  }
};

// Get application statistics (Admin only)
export const getApplicationStats = async (req, res) => {
  try {
    const stats = await VolunteerApplication.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const total = await VolunteerApplication.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCount = await VolunteerApplication.countDocuments({
      applicationDate: { $gte: today }
    });
    
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const weekCount = await VolunteerApplication.countDocuments({
      applicationDate: { $gte: thisWeek }
    });
    
    const monthlyStats = await VolunteerApplication.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$applicationDate' },
            month: { $month: '$applicationDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);
    
    // Get upcoming interviews
    const upcomingInterviews = await VolunteerApplication.countDocuments({
      status: 'interview-scheduled',
      'interviewDetails.date': { $gte: new Date() }
    });
    
    res.status(200).json({
      success: true,
      data: {
        total,
        today: todayCount,
        thisWeek: weekCount,
        upcomingInterviews,
        statusStats: stats,
        monthlyTrends: monthlyStats
      }
    });
    
  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application statistics'
    });
  }
};

// Delete volunteer application (Admin only)
export const deleteVolunteerApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason, sendRejectionEmail = false } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID'
      });
    }
    
    const application = await VolunteerApplication.findById(id)
      .populate('user', 'name email phone');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Get admin user info
    const adminUser = await User.findById(req.user.id);
    const adminName = adminUser?.name || 'Admin Team';
    
    // Send deletion email if requested
    if (sendRejectionEmail && application.user?.email) {
      await sendApplicationDeletedEmail(application, adminName, rejectionReason);
    }
    
    // Delete files from Cloudinary
    const deletePromises = [];
    
    if (application.documents?.resume?.publicId) {
      deletePromises.push(deleteFromCloudinary(application.documents.resume.publicId));
    }
    
    if (application.documents?.idProof?.publicId) {
      deletePromises.push(deleteFromCloudinary(application.documents.idProof.publicId));
    }
    
    if (application.documents?.addressProof?.publicId) {
      deletePromises.push(deleteFromCloudinary(application.documents.addressProof.publicId));
    }
    
    if (application.documents?.otherDocuments?.length > 0) {
      application.documents.otherDocuments.forEach(doc => {
        if (doc.publicId) {
          deletePromises.push(deleteFromCloudinary(doc.publicId));
        }
      });
    }
    
    // Wait for all file deletions
    await Promise.all(deletePromises);
    
    // Delete application from database
    await VolunteerApplication.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Application deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete application'
    });
  }
};

// Export applications (Admin only)
export const exportApplications = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (startDate || endDate) {
      query.applicationDate = {};
      if (startDate) query.applicationDate.$gte = new Date(startDate);
      if (endDate) query.applicationDate.$lte = new Date(endDate);
    }
    
    const applications = await VolunteerApplication.find(query)
      .populate('user', 'name email')
      .populate('reviewedBy', 'name')
      .populate('project', 'title')
      .lean();
    
    // Format data for CSV/Excel
    const formattedData = applications.map(app => ({
      'Application ID': app._id,
      'Name': `${app.personalInfo?.firstName || ''} ${app.personalInfo?.lastName || ''}`,
      'Email': app.contactInfo?.email || '',
      'Phone': app.contactInfo?.phone || '',
      'Date of Birth': app.personalInfo?.dateOfBirth ? new Date(app.personalInfo.dateOfBirth).toLocaleDateString() : '',
      'Gender': app.personalInfo?.gender || '',
      'Highest Education': app.educationInfo?.highestEducation || '',
      'Field of Study': app.educationInfo?.fieldOfStudy || '',
      'Employment Status': app.professionalInfo?.employmentStatus || '',
      'Skills': app.professionalInfo?.skills?.join(', ') || '',
      'Previous Experience': app.volunteerInfo?.previousVolunteerExperience || '',
      'Why Volunteer': app.volunteerInfo?.whyVolunteer || '',
      'Application Type': app.applicationType || '',
      'Project': app.projectTitle || '',
      'Status': app.status || '',
      'Applied Date': app.applicationDate ? new Date(app.applicationDate).toLocaleDateString() : '',
      'Reviewed By': app.reviewedBy?.name || '',
      'Review Date': app.reviewDate ? new Date(app.reviewDate).toLocaleDateString() : '',
      'Rejection Reason': app.rejectionReason || ''
    }));
    
    res.status(200).json({
      success: true,
      data: formattedData,
      count: applications.length
    });
    
  } catch (error) {
    console.error('Error exporting applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export applications'
    });
  }
};

// Get dashboard statistics for admin
export const getAdminDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get application trends for last 30 days
    const dailyApplications = await VolunteerApplication.aggregate([
      {
        $match: {
          applicationDate: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$applicationDate" } }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } },
      { $limit: 30 }
    ]);
    
    // Get status distribution
    const statusDistribution = await VolunteerApplication.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get today's applications
    const todaysApplications = await VolunteerApplication.countDocuments({
      applicationDate: { $gte: today }
    });
    
    // Get pending applications
    const pendingApplications = await VolunteerApplication.countDocuments({
      status: { $in: ['pending', 'under-review'] }
    });
    
    // Get upcoming interviews
    const upcomingInterviews = await VolunteerApplication.countDocuments({
      status: 'interview-scheduled',
      'interviewDetails.date': { $gte: new Date() }
    });
    
    res.status(200).json({
      success: true,
      data: {
        dailyApplications,
        statusDistribution,
        todaysApplications,
        pendingApplications,
        upcomingInterviews,
        totalApplications: await VolunteerApplication.countDocuments()
      }
    });
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};