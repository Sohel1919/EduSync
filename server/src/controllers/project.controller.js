import Project from '../models/project.model.js';
import cloudinary from '../utils/cloudinary.js';

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const {
      title,
      summary,
      description,
      category,
      targetAmount,
      collectedAmount = 0,
      deadline,
      images,
      tags,
      beneficiaries,
      organization,
      location,
      status = 'draft'
    } = req.body;

    // Check if project with same title exists for this user
    const existingProject = await Project.findOne({
      title,
      createdBy: req.user._id // Changed from req.user.id to req.user._id
    });

    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: 'You already have a project with this title'
      });
    }

    // Upload images to Cloudinary if provided
    let uploadedImages = [];
    if (images && images.length > 0) {
      try {
        const uploadPromises = images.map(async (image) => {
          if (image.startsWith('data:image')) {
            const uploadResponse = await cloudinary.uploader.upload(image, {
              folder: 'charity-projects',
              resource_type: 'image'
            });
            return uploadResponse.secure_url;
          } else if (image.startsWith('http')) {
            return image;
          }
        });
        
        uploadedImages = (await Promise.all(uploadPromises)).filter(Boolean);
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Error uploading images'
        });
      }
    }

    const project = await Project.create({
      title,
      summary,
      description,
      category,
      targetAmount: parseFloat(targetAmount),
      collectedAmount: parseFloat(collectedAmount),
      deadline: new Date(deadline),
      images: uploadedImages,
      tags: tags || [],
      beneficiaries: parseInt(beneficiaries),
      organization,
      location,
      status,
      createdBy: req.user._id // Changed from req.user.id to req.user._id
    });

    await project.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });

  } catch (error) {
    console.error('Create project error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Project with this title already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating project'
    });
  }
};

// @desc    Get all projects with filtering and pagination
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } }
      ];
    }

    // Use optionalAuth to check if user is authenticated
    if (!req.user) {
      filter.status = 'active';
    }

    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const projects = await Project.find(filter)
      .populate('createdBy', 'name email')
      .sort(sortConfig)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments(filter);

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
      message: 'Server error fetching projects'
    });
  }
};

// Get all projects (for admin - includes all statuses)
const getAllProjects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50, // Higher limit for admin
      category,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    // Status filter - for admin, show all statuses by default
    if (status && status !== 'all') {
      filter.status = status;
    }
    // If status is 'all' or not provided, don't filter by status (show all)

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const projects = await Project.find(filter)
      .populate('createdBy', 'name email')
      .sort(sortConfig)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments(filter);

    // Get stats for all projects
    const stats = await Project.aggregate([
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          totalTargetAmount: { $sum: '$targetAmount' },
          totalCollectedAmount: { $sum: '$collectedAmount' },
          totalBeneficiaries: { $sum: '$beneficiaries' },
          activeProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          pausedProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'paused'] }, 1, 0] }
          },
          completedProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          draftProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          }
        }
      }
    ]);

    const statusCounts = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryCounts = await Project.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: projects,
      stats: stats[0] || {
        totalProjects: 0,
        totalTargetAmount: 0,
        totalCollectedAmount: 0,
        totalBeneficiaries: 0,
        activeProjects: 0,
        pausedProjects: 0,
        completedProjects: 0,
        draftProjects: 0
      },
      statusCounts,
      categoryCounts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProjects: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching all projects'
    });
  }
};

// Get projects for admin dashboard with comprehensive filtering
const getAdminProjects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category = 'all',
      status = 'all',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Search filter
    if (search.trim()) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { 'createdBy.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Sort configuration
    const sortConfig = {};
    let sortField = sortBy;
    
    // Map frontend sort fields to database fields
    const sortFieldMap = {
      'newest': 'createdAt',
      'oldest': 'createdAt',
      'highest-collected': 'collectedAmount',
      'deadline': 'deadline',
      'title': 'title'
    };
    
    sortField = sortFieldMap[sortBy] || sortBy;
    sortConfig[sortField] = sortOrder === 'desc' || sortBy === 'newest' ? -1 : 1;

    // Execute query
    const projects = await Project.find(filter)
      .populate('createdBy', 'name email avatar')
      .sort(sortConfig)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Project.countDocuments(filter);

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
    console.error('Get admin projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching admin projects',
      error: error.message
    });
  }
};

// @desc    Get single project by ID or slug
// @route   GET /api/projects/:id
// @access  Public
const getProject = async (req, res) => {
  try {
    const { id } = req.params;

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    const project = await Project.findOne(
      isObjectId ? { _id: id } : { slug: id }
    ).populate('createdBy', 'name email organization');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // If user is not authenticated and project is not active, don't show
    if (!req.user && project.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
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
      message: 'Server error fetching project'
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    let project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns the project or is admin
    if (project.createdBy.toString() !== req.user._id && req.user.role !== 'admin') { // Changed to req.user._id
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    if (req.body.images && req.body.images.length > 0) {
      const uploadPromises = req.body.images.map(async (image) => {
        if (image.startsWith('data:image')) {
          const uploadResponse = await cloudinary.uploader.upload(image, {
            folder: 'charity-projects',
            resource_type: 'image'
          });
          return uploadResponse.secure_url;
        }
        return image;
      });
      
      req.body.images = (await Promise.all(uploadPromises)).filter(Boolean);
    }

    project = await Project.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });

  } catch (error) {
    console.error('Update project error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating project'
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns the project or is admin
    if (project.createdBy.toString() !== req.user._id && req.user.role !== 'admin') { // Changed to req.user._id
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    await Project.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting project'
    });
  }
};

// @desc    Get user's projects
// @route   GET /api/projects/user/my-projects
// @access  Private
const getUserProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { createdBy: req.user._id }; // Changed to req.user._id
    if (status) filter.status = status;

    const projects = await Project.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments(filter);

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
    console.error('Get user projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user projects'
    });
  }
};

export {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getUserProjects,
  getAdminProjects,
  getAllProjects
};