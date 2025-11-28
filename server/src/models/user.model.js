import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    public_id: String,
    url: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/v1624391337/default-avatar.png'
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'volunteer', 'donor', 'beneficiary'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  profile: {
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    dateOfBirth: Date
  },
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification'
  }],
  
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    beneficiaryApplications: { type: Boolean, default: true },
    projectUpdates: { type: Boolean, default: true },
    donationReceipts: { type: Boolean, default: true },
    donationUpdates: { type: Boolean, default: true }
  },

  // Donation specific fields
  donationPreferences: {
    causes: [{
      type: String,
      enum: ['education', 'healthcare', 'women', 'general']
    }],
    frequency: {
      type: String,
      enum: ['one-time', 'monthly', 'quarterly', 'yearly'],
      default: 'one-time'
    },
    isAnonymous: {
      type: Boolean,
      default: false
    }
  },

  // Donation statistics
  donationStats: {
    totalDonations: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    lastDonationDate: Date,
    firstDonationDate: Date,
    favoriteCause: {
      type: String,
      enum: ['education', 'healthcare', 'women', 'general']
    }
  },

  // Payment preferences (for recurring donations)
  paymentMethods: [{
    razorpay_payment_id: String,
    method: String,
    bank: String,
    wallet: String,
    isDefault: {
      type: Boolean,
      default: false
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Subscription for recurring donations
  subscriptions: [{
    razorpay_subscription_id: String,
    plan_id: String,
    status: {
      type: String,
      enum: ['active', 'paused', 'cancelled', 'completed']
    },
    amount: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    frequency: String,
    next_payment_date: Date,
    created_at: Date
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if email verification token is expired
userSchema.methods.isEmailVerificationTokenExpired = function() {
  return Date.now() > this.emailVerificationExpires;
};

// Check if reset password token is expired
userSchema.methods.isResetPasswordTokenExpired = function() {
  return Date.now() > this.resetPasswordExpires;
};

// Update user role to donor after first successful donation
userSchema.methods.updateToDonor = async function() {
  if (this.role === 'user') {
    this.role = 'donor';
    await this.save();
  }
  return this;
};

// Update donation statistics
userSchema.methods.updateDonationStats = async function(amount, cause) {
  this.donationStats.totalDonations += 1;
  this.donationStats.totalAmount += amount;
  this.donationStats.lastDonationDate = new Date();
  
  if (!this.donationStats.firstDonationDate) {
    this.donationStats.firstDonationDate = new Date();
  }

  // Update favorite cause based on most donated cause
  if (cause) {
    // This would require additional logic to track cause frequency
    // For now, just set the latest cause as favorite
    this.donationStats.favoriteCause = cause;
  }

  await this.save();
  return this;
};

// Add payment method
userSchema.methods.addPaymentMethod = async function(paymentData) {
  const { razorpay_payment_id, method, bank, wallet } = paymentData;
  
  // If this is the first payment method, set as default
  const isDefault = this.paymentMethods.length === 0;
  
  this.paymentMethods.push({
    razorpay_payment_id,
    method,
    bank,
    wallet,
    isDefault,
    addedAt: new Date()
  });

  await this.save();
  return this;
};

// Get default payment method
userSchema.methods.getDefaultPaymentMethod = function() {
  return this.paymentMethods.find(method => method.isDefault) || this.paymentMethods[0];
};

export default mongoose.model('User', userSchema);