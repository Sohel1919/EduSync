import Volunteer from '../models/volunteer.model.js';
import User from '../models/user.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

export const createVolunteer = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      location,
      address,
      dateOfBirth,
      skills,
      availability,
      status,
      bio,
      emergencyContact,
      notes
    } = req.body;

    console.log('Creating volunteer:', { fullName, email, phone });

    // Check if volunteer already exists with this email
    const existingVolunteer = await Volunteer.findOne({ email });
    if (existingVolunteer) {
      return res.status(400).json({
        success: false,
        message: 'Volunteer already exists with this email'
      });
    }

    // Check if user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Set default password for volunteer
    const defaultPassword = 'Volunteer@123';

    // Create user account for volunteer
    const userData = {
      name: fullName,
      email,
      password: defaultPassword,
      role: 'volunteer',
      isVerified: true, // Auto-verify without email
      profile: {
        phone,
        bio
      }
    };

    // Handle profile image upload if provided
    if (req.file) {
      console.log('Uploading profile image for volunteer...');
      try {
        const uploadResponse = await uploadToCloudinary(req.file.buffer);
        userData.avatar = {
          public_id: uploadResponse.public_id,
          url: uploadResponse.secure_url
        };
      } catch (uploadError) {
        console.error('Profile image upload error:', uploadError);
        // Continue without profile image if upload fails
      }
    }

    // Create user
    const user = new User(userData);
    await user.save();

    // Parse emergency contact if it's a string
    let emergencyContactData = {};
    if (emergencyContact) {
      if (typeof emergencyContact === 'string') {
        try {
          emergencyContactData = JSON.parse(emergencyContact);
        } catch (error) {
          emergencyContactData = {};
        }
      } else {
        emergencyContactData = emergencyContact;
      }
    }

    // Parse skills if it's a string
    let skillsArray = [];
    if (skills) {
      if (typeof skills === 'string') {
        try {
          skillsArray = JSON.parse(skills);
        } catch (error) {
          skillsArray = [];
        }
      } else {
        skillsArray = skills;
      }
    }

    // Create volunteer record
    const volunteerData = {
      user: user._id,
      fullName,
      email,
      phone,
      location,
      address,
      dateOfBirth: dateOfBirth || null,
      skills: skillsArray,
      availability: availability || 'part-time',
      status: status || 'active',
      bio,
      emergencyContact: emergencyContactData,
      notes,
      profileImage: user.avatar
    };

    const volunteer = new Volunteer(volunteerData);
    await volunteer.save();

    // Populate the volunteer with user data
    const populatedVolunteer = await Volunteer.findById(volunteer._id).populate('user', 'name email avatar role');

    console.log('Volunteer created successfully:', volunteer._id);
    console.log('Default password set for volunteer:', defaultPassword);

    res.status(201).json({
      success: true,
      message: 'Volunteer created successfully',
      volunteer: populatedVolunteer
    });

  } catch (error) {
    console.error('Create volunteer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating volunteer'
    });
  }
};

export const updateVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    console.log('Updating volunteer:', id);

    // Find volunteer
    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    // Parse skills if it's a string
    if (updateData.skills && typeof updateData.skills === 'string') {
      try {
        updateData.skills = JSON.parse(updateData.skills);
      } catch (error) {
        // Keep original skills if parsing fails
        delete updateData.skills;
      }
    }

    // Parse emergency contact if it's a string
    if (updateData.emergencyContact && typeof updateData.emergencyContact === 'string') {
      try {
        updateData.emergencyContact = JSON.parse(updateData.emergencyContact);
      } catch (error) {
        // Keep original emergency contact if parsing fails
        delete updateData.emergencyContact;
      }
    }

    // Handle profile image update
    if (req.file) {
      console.log('Updating profile image...');
      try {
        // Delete old image if exists
        if (volunteer.profileImage?.public_id) {
          await deleteFromCloudinary(volunteer.profileImage.public_id);
        }

        // Upload new image
        const uploadResponse = await uploadToCloudinary(req.file.buffer);
        updateData.profileImage = {
          public_id: uploadResponse.public_id,
          url: uploadResponse.secure_url
        };

        // Also update user avatar
        await User.findByIdAndUpdate(volunteer.user, {
          avatar: updateData.profileImage
        });

      } catch (uploadError) {
        console.error('Profile image update error:', uploadError);
        // Continue without updating image
        delete updateData.profileImage;
      }
    }

    // Update user data if name or email changed
    if (updateData.fullName || updateData.email) {
      const userUpdate = {};
      if (updateData.fullName) userUpdate.name = updateData.fullName;
      if (updateData.email) userUpdate.email = updateData.email;

      await User.findByIdAndUpdate(volunteer.user, userUpdate);
    }

    // Update volunteer
    const updatedVolunteer = await Volunteer.findByIdAndUpdate(
      id,
      { ...updateData, lastActive: new Date() },
      { new: true, runValidators: true }
    ).populate('user', 'name email avatar role');

    console.log('Volunteer updated successfully:', id);

    res.json({
      success: true,
      message: 'Volunteer updated successfully',
      volunteer: updatedVolunteer
    });

  } catch (error) {
    console.error('Update volunteer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating volunteer'
    });
  }
};

export const getVolunteers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const volunteers = await Volunteer.find(filter)
      .populate('user', 'name email avatar role isVerified')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Volunteer.countDocuments(filter);

    res.json({
      success: true,
      volunteers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get volunteers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching volunteers'
    });
  }
};

export const getVolunteer = async (req, res) => {
  try {
    const { id } = req.params;

    const volunteer = await Volunteer.findById(id)
      .populate('user', 'name email avatar role isVerified createdAt');

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    res.json({
      success: true,
      volunteer
    });

  } catch (error) {
    console.error('Get volunteer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching volunteer'
    });
  }
};

export const deleteVolunteer = async (req, res) => {
  try {
    const { id } = req.params;

    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    // Delete profile image if exists
    if (volunteer.profileImage?.public_id) {
      await deleteFromCloudinary(volunteer.profileImage.public_id);
    }

    // Delete user account
    await User.findByIdAndDelete(volunteer.user);

    // Delete volunteer record
    await Volunteer.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Volunteer deleted successfully'
    });

  } catch (error) {
    console.error('Delete volunteer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting volunteer'
    });
  }
};

export const updateVolunteerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const volunteer = await Volunteer.findByIdAndUpdate(
      id,
      { status, lastActive: new Date() },
      { new: true }
    ).populate('user', 'name email avatar role');

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    res.json({
      success: true,
      message: 'Volunteer status updated successfully',
      volunteer
    });

  } catch (error) {
    console.error('Update volunteer status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating volunteer status'
    });
  }
};