import ProjectRequest from '../models/projectRequest.model.js';
import Project from '../models/project.model.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import { emitNotification, emitNotificationToAdmins } from '../utils/socket.js';

// Create new project - FIXED NOTIFICATION FOR ADMINS
export const createProject = async (req, res) => {
  try {
    const {
      title,
      summary,
      description,
      category,
      targetAmount,
      deadline,
      beneficiaries,
      organization,
      location,
      tags
    } = req.body;

    // Check if user exists
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create project
    const projectData = {
      title,
      summary,
      description,
      category,
      targetAmount: parseFloat(targetAmount),
      deadline: new Date(deadline),
      beneficiaries: parseInt(beneficiaries),
      organization,
      location,
      tags: Array.isArray(tags) ? tags : JSON.parse(tags || '[]'),
      createdBy: req.user._id
    };

    // Handle image upload
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, 'projects');
        projectData.projectImage = {
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url
        };
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Failed to upload project image'
        });
      }
    }

    const project = new ProjectRequest(projectData);
    await project.save();

    // Populate createdBy field for response
    await project.populate('createdBy', 'name email');

    // Send notification to admin about new project submission - FIXED
    try {
      // Find all admin users
      const adminUsers = await User.find({ role: 'admin' });
      
      // Create notifications for all admins
      const adminNotifications = adminUsers.map(admin => 
        new Notification({
          recipient: admin._id,
          type: 'NEW_PROJECT_SUBMISSION',
          title: 'New Project Submitted for Review',
          message: `A new project "${title}" has been submitted for review by ${user.name}`,
          data: {
            projectId: project._id,
            projectTitle: title,
            submittedBy: user.name,
            category: category
          },
          priority: 'high'
        })
      );

      await Notification.insertMany(adminNotifications);

      // Emit socket notification to admin room
      emitNotificationToAdmins({
        type: 'NEW_PROJECT_SUBMISSION',
        title: 'New Project Submission',
        message: `A new project "${title}" has been submitted for review`,
        data: {
          projectId: project._id,
          projectTitle: title,
          submittedBy: user.name,
          category: category,
          createdAt: new Date()
        },
        timestamp: new Date()
      });

      console.log(`Sent notifications to ${adminUsers.length} admins for new project submission`);

    } catch (notificationError) {
      console.error('Notification error:', notificationError);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Project created successfully and submitted for approval',
      data: project
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
};

// Admin: Approve/Reject project - COMPLETELY REWRITTEN
export const updateProjectStatus = async (req, res) => {
  try {
    const { isApproved, rejectionReason } = req.body;
    const projectId = req.params.id;

    console.log(`Updating project status for ${projectId}:`, { isApproved, rejectionReason });

    if (!['approved', 'rejected'].includes(isApproved)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "approved" or "rejected"'
      });
    }

    // Find the project request
    const projectRequest = await ProjectRequest.findById(projectId)
      .populate('createdBy', 'name email _id');
    
    if (!projectRequest) {
      return res.status(404).json({
        success: false,
        message: 'Project request not found'
      });
    }

    if (isApproved === 'approved') {
      try {
        // Create a new project in the main Project model
        const newProjectData = {
          title: projectRequest.title,
          summary: projectRequest.summary,
          description: projectRequest.description,
          category: projectRequest.category,
          targetAmount: projectRequest.targetAmount,
          collectedAmount: 0,
          deadline: projectRequest.deadline,
          images: projectRequest.projectImage ? [projectRequest.projectImage.url] : [],
          tags: projectRequest.tags || [],
          beneficiaries: projectRequest.beneficiaries,
          organization: projectRequest.organization,
          location: projectRequest.location,
          status: 'active',
          createdBy: projectRequest.createdBy._id
        };

        const newProject = new Project(newProjectData);
        await newProject.save();

        console.log('New project created in main Project model:', newProject._id);

        // Update the project request status
        projectRequest.isApproved = 'approved';
        projectRequest.rejectionReason = undefined;
        await projectRequest.save();

        // Send notification to project creator
        try {
          const notification = new Notification({
            recipient: projectRequest.createdBy._id,
            type: 'PROJECT_STATUS_UPDATE',
            title: 'Project Approved! 🎉',
            message: `Your project "${projectRequest.title}" has been successfully approved by admin and is now live on the platform!`,
            data: {
              projectId: newProject._id,
              projectTitle: projectRequest.title,
              status: 'approved'
            },
            priority: 'high'
          });
          await notification.save();

          // Emit socket notification
          emitNotification(projectRequest.createdBy._id.toString(), {
            type: 'PROJECT_STATUS_UPDATE',
            title: 'Project Approved! 🎉',
            message: `Your project "${projectRequest.title}" has been successfully approved by admin and is now live!`,
            data: {
              projectId: newProject._id,
              projectTitle: projectRequest.title,
              status: 'approved'
            },
            timestamp: new Date()
          });

          console.log('Approval notification sent to project creator');

        } catch (notificationError) {
          console.error('Approval notification error:', notificationError);
        }

        res.json({
          success: true,
          message: 'Project approved successfully and added to live projects',
          data: {
            projectRequest,
            newProjectId: newProject._id
          }
        });

      } catch (projectCreationError) {
        console.error('Error creating project in main model:', projectCreationError);
        return res.status(500).json({
          success: false,
          message: 'Failed to create project in main database',
          error: projectCreationError.message
        });
      }

    } else if (isApproved === 'rejected') {
      // Handle rejection
      projectRequest.isApproved = 'rejected';
      projectRequest.rejectionReason = rejectionReason || 'No reason provided';
      
      await projectRequest.save();

      // Send notification to project creator
      try {
        const notification = new Notification({
          recipient: projectRequest.createdBy._id,
          type: 'PROJECT_STATUS_UPDATE',
          title: 'Project Rejected',
          message: `Your project "${projectRequest.title}" has been rejected${rejectionReason ? `: ${rejectionReason}` : ''}. Please review the feedback and resubmit with necessary changes.`,
          data: {
            projectId: projectRequest._id,
            projectTitle: projectRequest.title,
            status: 'rejected',
            rejectionReason: rejectionReason || 'No reason provided'
          },
          priority: 'high'
        });
        await notification.save();

        // Emit socket notification
        emitNotification(projectRequest.createdBy._id.toString(), {
          type: 'PROJECT_STATUS_UPDATE',
          title: 'Project Rejected',
          message: `Your project "${projectRequest.title}" has been rejected${rejectionReason ? `: ${rejectionReason}` : ''}. Please review and resubmit.`,
          data: {
            projectId: projectRequest._id,
            projectTitle: projectRequest.title,
            status: 'rejected',
            rejectionReason
          },
          timestamp: new Date()
        });

        console.log('Rejection notification sent to project creator');

      } catch (notificationError) {
        console.error('Rejection notification error:', notificationError);
      }

      res.json({
        success: true,
        message: 'Project rejected successfully',
        data: projectRequest
      });
    }

  } catch (error) {
    console.error('Update project status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project status',
      error: error.message
    });
  }
};


// Get all projects (with filtering and pagination)
export const getProjects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      isApproved,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    // Add filters
    if (category) filter.category = category;
    if (isApproved) filter.isApproved = isApproved;
    
    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } }
      ];
    }

    // For non-admin users, only show approved projects or their own projects
    if (req.user.role !== 'admin') {
      filter.$or = [
        { isApproved: 'approved' },
        { createdBy: req.user._id }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const projects = await ProjectRequest.find(filter)
      .populate('createdBy', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await ProjectRequest.countDocuments(filter);

    res.json({
      success: true,
      data: projects,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProjects: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
};

// Get single project
export const getProject = async (req, res) => {
  try {
    const project = await ProjectRequest.findById(req.params.id)
      .populate('createdBy', 'name email profileImage');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user can view this project
    if (project.isApproved !== 'approved' && 
        project.createdBy._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: project
    });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error.message
    });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const project = await ProjectRequest.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns the project or is admin
    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own projects.'
      });
    }

    // If non-admin is updating, reset approval status to pending
    if (req.user.role !== 'admin') {
      req.body.isApproved = 'pending';
    }

    const updates = { ...req.body };

    // Handle image upload
    if (req.file) {
      try {
        // Delete old image if exists
        if (project.projectImage?.public_id) {
          await deleteFromCloudinary(project.projectImage.public_id);
        }

        const uploadResult = await uploadToCloudinary(req.file.buffer, 'projects');
        updates.projectImage = {
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url
        };
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Failed to upload project image'
        });
      }
    }

    // Parse numeric fields
    if (updates.targetAmount) updates.targetAmount = parseFloat(updates.targetAmount);
    if (updates.beneficiaries) updates.beneficiaries = parseInt(updates.beneficiaries);
    if (updates.deadline) updates.deadline = new Date(updates.deadline);
    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = JSON.parse(updates.tags);
    }

    const updatedProject = await ProjectRequest.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message
    });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const project = await ProjectRequest.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns the project or is admin
    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own projects.'
      });
    }

    // Delete image from Cloudinary if exists
    if (project.projectImage?.public_id) {
      await deleteFromCloudinary(project.projectImage.public_id);
    }

    await ProjectRequest.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
};

// Delete rejected project (for project owner to delete their rejected project)
export const deleteRejectedProject = async (req, res) => {
  try {
    const projectRequest = await ProjectRequest.findById(req.params.id);

    if (!projectRequest) {
      return res.status(404).json({
        success: false,
        message: 'Project request not found'
      });
    }

    // Check if user owns the project request
    if (projectRequest.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own project requests.'
      });
    }

    // Check if project is rejected
    if (projectRequest.isApproved !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Only rejected projects can be deleted by the owner'
      });
    }

    // Delete image from Cloudinary if exists
    if (projectRequest.projectImage?.public_id) {
      await deleteFromCloudinary(projectRequest.projectImage.public_id);
    }

    await ProjectRequest.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Rejected project deleted successfully'
    });

  } catch (error) {
    console.error('Delete rejected project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete rejected project',
      error: error.message
    });
  }
};

// Get user's projects
export const getUserProjects = async (req, res) => {
  try {
    const projects = await ProjectRequest.find({ createdBy: req.user._id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: projects
    });

  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user projects',
      error: error.message
    });
  }
};

// Get projects for admin (with pending approval)
export const getAdminProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = {};
    if (status && status !== 'all') filter.isApproved = status;

    const projects = await ProjectRequest.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await ProjectRequest.countDocuments(filter);

    res.json({
      success: true,
      data: projects,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProjects: total
      }
    });

  } catch (error) {
    console.error('Get admin projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin projects',
      error: error.message
    });
  }
};