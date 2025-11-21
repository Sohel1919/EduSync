import User from '../models/user.model.js';

export const createUser = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

export const findUserByEmail = async (email, includePassword = false) => {
  if (includePassword) {
    return await User.findOne({ email }).select('+password');
  }
  return await User.findOne({ email });
};

export const findUserById = async (id, includePassword = false) => {
  if (includePassword) {
    return await User.findById(id).select('+password');
  }
  return await User.findById(id);
};

export const updateUserById = async (id, updateData) => {
  return await User.findByIdAndUpdate(
    id,
    { $set: updateData }, 
    { new: true, runValidators: true }
  ).select('-password');
};

export const deleteUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Delete avatar from Cloudinary if exists
  if (user.avatar && user.avatar.public_id) {
    try {
      await deleteFromCloudinary(user.avatar.public_id);
    } catch (error) {
      console.error('Error deleting avatar from Cloudinary:', error);
      // Continue with user deletion even if avatar deletion fails
    }
  }
  
  return await User.findByIdAndDelete(id);
};

export const verifyUserEmail = async (email, token) => {
  const user = await User.findOne({ 
    email,
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new Error('Invalid or expired verification token');
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return user;
};

export const setPasswordResetToken = async (email, token) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  return user;
};

export const resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return user;
};