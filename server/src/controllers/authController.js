import { generateToken, generateEmailVerificationToken, generateResetToken } from '../utils/jwt.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';
import * as userService from '../services/userService.js';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const avatarFile = req.file; 

    // Check if user already exists
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Generate verification token
    const verificationToken = generateEmailVerificationToken();

    // Create user data
    const userData = {
      name,
      email,
      password,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: Date.now() + 3600000 // 1 hour
    };

    // Handle avatar upload if provided
    if (avatarFile) {
      console.log('Avatar file received:', {
        originalname: avatarFile.originalname,
        mimetype: avatarFile.mimetype,
        size: avatarFile.size,
        bufferLength: avatarFile.buffer?.length
      });

      // Validate the file buffer before uploading
      if (!avatarFile.buffer || avatarFile.buffer.length === 0) {
        console.error('Invalid avatar file buffer');
        return res.status(400).json({
          success: false,
          message: 'Invalid avatar file'
        });
      }

      try {
        console.log('Uploading avatar to Cloudinary...');
        const uploadResponse = await uploadToCloudinary(avatarFile.buffer);
        console.log('Cloudinary upload success:', {
          public_id: uploadResponse.public_id,
          url: uploadResponse.secure_url
        });

        userData.avatar = {
          public_id: uploadResponse.public_id,
          url: uploadResponse.secure_url
        };
      } catch (uploadError) {
        console.error('Avatar upload error:', uploadError);
        // Continue without avatar if upload fails
        console.log('Continuing user creation without avatar due to upload error');
      }
    } else {
      console.log('No avatar file provided');
    }

    // Create user
    const user = await userService.createUser(userData);
    console.log('User created successfully:', user._id);

    // Send verification email
    try {
      await sendVerificationEmail(email, name, verificationToken);
      console.log('Verification email sent successfully');
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue with user creation even if email fails
    }

    // Prepare user response without sensitive data
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified
    };

    console.log('Registration completed successfully:', userResponse);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification code.',
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await userService.findUserByEmail(email, true); 
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    // Generate token
    const token = generateToken({ id: user._id });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, token } = req.body;

    const user = await userService.verifyUserEmail(email, token);

    // Generate token after verification
    const authToken = generateToken({ id: user._id });

    res.json({
      success: true,
      message: 'Email verified successfully',
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = generateEmailVerificationToken();
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 3600000;
    await user.save();

    // Send verification email
    await sendVerificationEmail(email, user.name, verificationToken);

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email'
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userService.findUserByEmail(email);
    if (!user) {
      // Don't reveal whether email exists or not
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    const resetToken = generateResetToken();
    await userService.setPasswordResetToken(email, resetToken);

    // Send reset email
    await sendPasswordResetEmail(email, user.name, resetToken);

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request'
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    await userService.resetPassword(token, newPassword);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await userService.findUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Profile fetched:', {
      userId: user._id,
      hasAvatar: !!user.avatar,
      avatarUrl: user.avatar?.url
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, dateOfBirth, address } = req.body;
    const avatarFile = req.file; 

    console.log('Update profile request:', {
      userId: req.user.id,
      hasAvatarFile: !!avatarFile,
      name, phone, bio
    });

    const updateData = {
      name,
      'profile.phone': phone,
      'profile.bio': bio,
      'profile.dateOfBirth': dateOfBirth,
      'profile.address': address
    };

    // Handle avatar update
    if (avatarFile) {
      console.log('Processing avatar update:', {
        originalname: avatarFile.originalname,
        mimetype: avatarFile.mimetype,
        size: avatarFile.size
      });

      // Validate the file buffer before uploading
      if (!avatarFile.buffer || avatarFile.buffer.length === 0) {
        console.error('Invalid avatar file buffer in update');
        return res.status(400).json({
          success: false,
          message: 'Invalid avatar file'
        });
      }

      try {
        // Get current user to delete old avatar
        const currentUser = await userService.findUserById(req.user.id);
        
        // Delete old avatar if exists
        if (currentUser.avatar?.public_id) {
          console.log('Deleting old avatar:', currentUser.avatar.public_id);
          try {
            await deleteFromCloudinary(currentUser.avatar.public_id);
          } catch (deleteError) {
            console.error('Error deleting old avatar:', deleteError);
            // Continue with upload even if deletion fails
          }
        }

        // Upload new avatar
        console.log('Uploading new avatar to Cloudinary...');
        const uploadResponse = await uploadToCloudinary(avatarFile.buffer);
        console.log('New avatar uploaded successfully:', {
          public_id: uploadResponse.public_id,
          url: uploadResponse.secure_url
        });

        updateData.avatar = {
          public_id: uploadResponse.public_id,
          url: uploadResponse.secure_url
        };
      } catch (uploadError) {
        console.error('Avatar upload error in update:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload avatar image'
        });
      }
    }

    const updatedUser = await userService.updateUserById(req.user.id, updateData);

    console.log('Profile updated successfully:', {
      userId: updatedUser._id,
      hasAvatar: !!updatedUser.avatar
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        profile: updatedUser.profile
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const user = await userService.findUserById(req.user.id);

    // Delete avatar from Cloudinary if exists
    if (user.avatar?.public_id) {
      await deleteFromCloudinary(user.avatar.public_id);
    }

    await userService.deleteUserById(req.user.id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user and include password for verification
    const user = await userService.findUserById(req.user.id, true); 
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};