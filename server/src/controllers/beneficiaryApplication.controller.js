import Beneficiary from '../models/beneficiaryApplication.model.js';
import Project from '../models/project.model.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import { emitNotification } from '../utils/socket.js';

// Helper function to upload files to Cloudinary
const uploadFileToCloudinary = async (file, folder = 'beneficiary-documents') => {
  if (!file) return null;
  
  try {
    const result = await uploadToCloudinary(file.buffer, folder);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      originalName: file.originalname
    };
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    throw new Error(`Failed to upload ${file.originalname}`);
  }
};

// Helper function to upload multiple files
const uploadMultipleFiles = async (files, folder = 'beneficiary-documents') => {
  if (!files || files.length === 0) return [];
  
  const uploadPromises = files.map(file => uploadFileToCloudinary(file, folder));
  return Promise.all(uploadPromises);
};

// Create beneficiary application
export const createBeneficiaryApplication = async (req, res) => {
  try {
    // Check if user is authenticated and verified
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login to apply.'
      });
    }

    const { 
      projectId, 
      projectTitle,
      personalInfo, 
      contactInfo, 
      familyBackground, 
      applicationDetails, 
      additionalInfo 
    } = req.body;
    
    const files = req.files;
    const applicantId = req.user._id;

    // Validate required fields
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user already applied to this project
    const existingApplication = await Beneficiary.findOne({
      projectId,
      applicantId,
      status: { $in: ['pending', 'under-review', 'approved'] }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this project'
      });
    }

    // Upload documents to Cloudinary
    const documents = {};

    try {
      // Upload required documents
      if (files?.idProof) {
        documents.idProof = await uploadFileToCloudinary(files.idProof[0], 'beneficiary-documents/id-proof');
      }
      if (files?.addressProof) {
        documents.addressProof = await uploadFileToCloudinary(files.addressProof[0], 'beneficiary-documents/address-proof');
      }
      if (files?.incomeProof) {
        documents.incomeProof = await uploadFileToCloudinary(files.incomeProof[0], 'beneficiary-documents/income-proof');
      }
      if (files?.medicalProof) {
        documents.medicalProof = await uploadFileToCloudinary(files.medicalProof[0], 'beneficiary-documents/medical-proof');
      }

      // Upload other documents
      if (files?.otherDocuments) {
        documents.otherDocuments = await uploadMultipleFiles(files.otherDocuments, 'beneficiary-documents/other');
      }
    } catch (uploadError) {
      return res.status(400).json({
        success: false,
        message: `File upload failed: ${uploadError.message}`
      });
    }

    // Parse JSON data from form data
    let parsedPersonalInfo, parsedContactInfo, parsedFamilyBackground, parsedApplicationDetails, parsedAdditionalInfo;

    try {
      parsedPersonalInfo = typeof personalInfo === 'string' ? JSON.parse(personalInfo) : personalInfo;
      parsedContactInfo = typeof contactInfo === 'string' ? JSON.parse(contactInfo) : contactInfo;
      parsedFamilyBackground = typeof familyBackground === 'string' ? JSON.parse(familyBackground) : familyBackground;
      parsedApplicationDetails = typeof applicationDetails === 'string' ? JSON.parse(applicationDetails) : applicationDetails;
      parsedAdditionalInfo = typeof additionalInfo === 'string' ? JSON.parse(additionalInfo) : additionalInfo;
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid form data format'
      });
    }

    // Validate required personal info
    if (!parsedPersonalInfo?.firstName || !parsedPersonalInfo?.lastName || !parsedPersonalInfo?.dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and date of birth are required'
      });
    }

    // Create beneficiary application
    const beneficiaryApplication = new Beneficiary({
      projectId,
      projectTitle: projectTitle || project.title,
      applicantId,
      personalInfo: parsedPersonalInfo,
      contactInfo: parsedContactInfo,
      familyBackground: parsedFamilyBackground,
      applicationDetails: parsedApplicationDetails,
      additionalInfo: parsedAdditionalInfo,
      documents
    });

    await beneficiaryApplication.save();

    // Populate the application for response
    await beneficiaryApplication.populate('applicantId', 'firstName lastName email');

    // Find project creator to send notification
    const projectCreator = await User.findById(project.createdBy);
    
    if (projectCreator) {
      // Create notification
      const notification = new Notification({
        recipient: projectCreator._id,
        sender: applicantId,
        type: 'beneficiary_application',
        title: 'New Beneficiary Application',
        message: `A new beneficiary application has been submitted for your project "${project.title}"`,
        data: {
          projectId: project._id,
          beneficiaryId: beneficiaryApplication._id,
          applicantName: `${parsedPersonalInfo.firstName} ${parsedPersonalInfo.lastName}`
        },
        priority: 'high'
      });

      await notification.save();

      // Add notification to user's notifications array
      await User.findByIdAndUpdate(projectCreator._id, {
        $push: { notifications: notification._id }
      });

      // Emit real-time notification via socket
      try {
        emitNotification(projectCreator._id.toString(), {
          _id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          isRead: notification.isRead,
          createdAt: notification.createdAt
        });
      } catch (socketError) {
        console.error('Socket notification failed:', socketError);
        // Don't fail the request if socket fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: beneficiaryApplication._id,
        status: beneficiaryApplication.status,
        projectTitle: beneficiaryApplication.projectTitle,
        submittedAt: beneficiaryApplication.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating beneficiary application:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

// Get beneficiary applications for a project (project creator)
export const getProjectBeneficiaries = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    // Verify user owns the project
    const project = await Project.findOne({ _id: projectId, createdBy: userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    const beneficiaries = await Beneficiary.find({ projectId })
      .populate('applicantId', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: beneficiaries
    });

  } catch (error) {
    console.error('Error fetching project beneficiaries:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's beneficiary applications
export const getUserBeneficiaries = async (req, res) => {
  try {
    const userId = req.user._id;

    const beneficiaries = await Beneficiary.find({ applicantId: userId })
      .populate('projectId', 'title organization images status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: beneficiaries
    });

  } catch (error) {
    console.error('Error fetching user beneficiaries:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update beneficiary application status
export const updateBeneficiaryStatus = async (req, res) => {
  try {
    const { beneficiaryId } = req.params;
    const { status, reviewNotes } = req.body;
    const userId = req.user._id;

    // Validate status
    const validStatuses = ['pending', 'under-review', 'approved', 'rejected', 'on-hold'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const beneficiary = await Beneficiary.findById(beneficiaryId)
      .populate('projectId')
      .populate('applicantId', 'firstName lastName email');

    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: 'Beneficiary application not found'
      });
    }

    // Verify user owns the project or is admin
    const project = await Project.findOne({ 
      _id: beneficiary.projectId, 
      createdBy: userId 
    });

    if (!project && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not the project creator or admin.'
      });
    }

    // Update status
    beneficiary.status = status;
    beneficiary.reviewNotes = reviewNotes;
    beneficiary.reviewedBy = userId;
    beneficiary.reviewedAt = new Date();

    await beneficiary.save();

    // Send notification to applicant about status update
    const notification = new Notification({
      recipient: beneficiary.applicantId._id,
      sender: userId,
      type: 'application_status_update',
      title: 'Application Status Updated',
      message: `Your application for "${beneficiary.projectTitle}" has been ${status}`,
      data: {
        projectId: beneficiary.projectId._id,
        beneficiaryId: beneficiary._id,
        status: status
      }
    });

    await notification.save();

    // Add notification to applicant's notifications
    await User.findByIdAndUpdate(beneficiary.applicantId._id, {
      $push: { notifications: notification._id }
    });

    // Emit real-time notification
    try {
      emitNotification(beneficiary.applicantId._id.toString(), {
        _id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        isRead: notification.isRead,
        createdAt: notification.createdAt
      });
    } catch (socketError) {
      console.error('Socket notification failed:', socketError);
      // Don't fail the request if socket fails
    }

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      data: beneficiary
    });

  } catch (error) {
    console.error('Error updating beneficiary status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single beneficiary application
export const getBeneficiaryById = async (req, res) => {
  try {
    const { beneficiaryId } = req.params;
    const userId = req.user._id;

    const beneficiary = await Beneficiary.findById(beneficiaryId)
      .populate('applicantId', 'firstName lastName email phone')
      .populate('projectId', 'title organization createdBy')
      .populate('reviewedBy', 'firstName lastName');

    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: 'Beneficiary application not found'
      });
    }

    // Check access rights
    const isApplicant = beneficiary.applicantId._id.toString() === userId.toString();
    const isProjectOwner = beneficiary.projectId.createdBy.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isApplicant && !isProjectOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: beneficiary
    });

  } catch (error) {
    console.error('Error fetching beneficiary:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete beneficiary application (only by applicant)
export const deleteBeneficiaryApplication = async (req, res) => {
  try {
    const { beneficiaryId } = req.params;
    const userId = req.user._id;

    const beneficiary = await Beneficiary.findById(beneficiaryId);

    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: 'Beneficiary application not found'
      });
    }

    // Check if user is the applicant
    if (beneficiary.applicantId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own applications.'
      });
    }

    // Only allow deletion if status is pending (or admin can delete any)
    if (beneficiary.status !== 'pending' && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete application that is already under review or processed'
      });
    }

    // Delete uploaded files from Cloudinary
    const deletePromises = [];
    
    if (beneficiary.documents.idProof?.publicId) {
      deletePromises.push(deleteFromCloudinary(beneficiary.documents.idProof.publicId));
    }
    if (beneficiary.documents.addressProof?.publicId) {
      deletePromises.push(deleteFromCloudinary(beneficiary.documents.addressProof.publicId));
    }
    if (beneficiary.documents.incomeProof?.publicId) {
      deletePromises.push(deleteFromCloudinary(beneficiary.documents.incomeProof.publicId));
    }
    if (beneficiary.documents.medicalProof?.publicId) {
      deletePromises.push(deleteFromCloudinary(beneficiary.documents.medicalProof.publicId));
    }
    
    // Delete other documents
    if (beneficiary.documents.otherDocuments?.length > 0) {
      beneficiary.documents.otherDocuments.forEach(doc => {
        if (doc.publicId) {
          deletePromises.push(deleteFromCloudinary(doc.publicId));
        }
      });
    }

    await Promise.allSettled(deletePromises);

    // Delete the beneficiary application
    await Beneficiary.findByIdAndDelete(beneficiaryId);

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting beneficiary application:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all beneficiary applications (Admin only)
export const getAllBeneficiaryApplications = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { status, projectId, page = 1, limit = 50, search } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (projectId && projectId !== 'all') {
      filter.projectId = projectId;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { 'contactInfo.email': { $regex: search, $options: 'i' } },
        { 'contactInfo.phone': { $regex: search, $options: 'i' } },
        { projectTitle: { $regex: search, $options: 'i' } }
      ];
    }

    // Get applications with pagination
    const applications = await Beneficiary.find(filter)
      .populate('applicantId', 'firstName lastName email phone')
      .populate('projectId', 'title organization')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Beneficiary.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Error fetching admin applications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Bulk update beneficiary application status (Admin only)
export const bulkUpdateBeneficiaryStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { applicationIds, status, reviewNotes } = req.body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Application IDs are required'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'under-review', 'approved', 'rejected', 'on-hold'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Update applications
    const updateResult = await Beneficiary.updateMany(
      { _id: { $in: applicationIds } },
      {
        status,
        reviewNotes,
        reviewedBy: req.user._id,
        reviewedAt: new Date()
      }
    );

    // Send notifications to applicants
    const applications = await Beneficiary.find({ _id: { $in: applicationIds } })
      .populate('applicantId', 'firstName lastName email')
      .populate('projectId', 'title');

    for (const application of applications) {
      const notification = new Notification({
        recipient: application.applicantId._id,
        sender: req.user._id,
        type: 'application_status_update',
        title: 'Application Status Updated',
        message: `Your application for "${application.projectId.title}" has been ${status}`,
        data: {
          projectId: application.projectId._id,
          beneficiaryId: application._id,
          status: status
        }
      });

      await notification.save();

      // Add notification to user's notifications
      await User.findByIdAndUpdate(application.applicantId._id, {
        $push: { notifications: notification._id }
      });

      // Emit real-time notification
      try {
        emitNotification(application.applicantId._id.toString(), {
          _id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          isRead: notification.isRead,
          createdAt: notification.createdAt
        });
      } catch (socketError) {
        console.error('Socket notification failed:', socketError);
      }
    }

    res.status(200).json({
      success: true,
      message: `${updateResult.modifiedCount} applications updated successfully`,
      data: {
        modifiedCount: updateResult.modifiedCount
      }
    });

  } catch (error) {
    console.error('Error bulk updating applications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get beneficiary applications for volunteer's projects
export const getVolunteerProjectBeneficiaries = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, projectId, page = 1, limit = 50, search } = req.query;
    
    // Build filter for projects created by this volunteer
    const projectFilter = { createdBy: userId };
    
    if (projectId && projectId !== 'all') {
      projectFilter._id = projectId;
    }

    // Get volunteer's projects
    const volunteerProjects = await Project.find(projectFilter).select('_id title');
    
    if (volunteerProjects.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          current: 1,
          pages: 0,
          total: 0
        }
      });
    }

    const projectIds = volunteerProjects.map(project => project._id);
    
    // Build beneficiary filter
    const beneficiaryFilter = { projectId: { $in: projectIds } };
    
    if (status && status !== 'all') {
      beneficiaryFilter.status = status;
    }

    // Search filter
    if (search) {
      beneficiaryFilter.$or = [
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { 'contactInfo.email': { $regex: search, $options: 'i' } },
        { 'contactInfo.phone': { $regex: search, $options: 'i' } },
        { projectTitle: { $regex: search, $options: 'i' } }
      ];
    }

    // Get applications with pagination
    const applications = await Beneficiary.find(beneficiaryFilter)
      .populate('applicantId', 'firstName lastName email phone')
      .populate('projectId', 'title organization')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Beneficiary.countDocuments(beneficiaryFilter);

    res.status(200).json({
      success: true,
      data: applications,
      projects: volunteerProjects, // Return volunteer's projects for filter
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Error fetching volunteer project beneficiaries:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};