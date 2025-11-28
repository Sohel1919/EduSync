import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Donation from '../models/donation.model.js';
import User from '../models/user.model.js';
import { generateReceipt } from './receiptService.js';

// Initialize Razorpay with environment variable check
let razorpay;

try {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn('⚠️ Razorpay credentials are missing in environment variables');
  } else {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('✅ Razorpay initialized successfully');
  }
} catch (error) {
  console.error('❌ Razorpay initialization failed:', error.message);
}

// @desc    Create Razorpay order
// @route   Internal
// @access  Private
const createOrder = async (amount, currency = 'INR') => {
  try {
    // Check if Razorpay is initialized
    if (!razorpay) {
      throw new Error('Razorpay payment gateway is not configured');
    }

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency,
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    throw new Error(`Failed to create payment order: ${error.message}`);
  }
};

// @desc    Verify payment signature
// @route   Internal
// @access  Private
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay key secret is not configured');
    }

    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    return expectedSignature === signature;
  } catch (error) {
    console.error('Payment signature verification error:', error);
    return false;
  }
};

// @desc    Create donation record
// @route   Internal
// @access  Private
const createDonationRecord = async (donationData) => {
  try {
    const donation = new Donation(donationData);
    await donation.save();
    return donation;
  } catch (error) {
    console.error('Donation record creation error:', error);
    throw new Error('Failed to create donation record');
  }
};

// @desc    Update donation status
// @route   Internal
// @access  Private
const updateDonationStatus = async (orderId, status, paymentData = {}) => {
  try {
    const updateData = { status };
    
    if (status === 'completed') {
      updateData.razorpay_payment_id = paymentData.paymentId;
      updateData.razorpay_signature = paymentData.signature;
      updateData.payment_method = paymentData.method;
      updateData.bank = paymentData.bank;
      updateData.wallet = paymentData.wallet;
      
      // Generate receipt
      try {
        const receiptUrl = await generateReceipt({
          donation: { ...paymentData.donation, _id: paymentData.donationId },
          donorInfo: paymentData.donorInfo
        });
        updateData.receipt_url = receiptUrl;
      } catch (receiptError) {
        console.error('Receipt generation failed:', receiptError);
        // Continue without receipt URL
      }
    }

    const donation = await Donation.findOneAndUpdate(
      { razorpay_order_id: orderId },
      updateData,
      { new: true }
    ).populate('donor');

    if (status === 'completed' && donation) {
      // Update user role and donation stats
      await updateUserDonationStats(donation.donor, donation.amount, donation.cause);
      
      // Add payment method to user's profile for future donations
      if (!donation.donor_info.isAnonymous) {
        await addUserPaymentMethod(donation.donor, paymentData);
      }
    }

    return donation;
  } catch (error) {
    console.error('Donation status update error:', error);
    throw new Error('Failed to update donation status');
  }
};

// @desc    Update user donation statistics and role
// @route   Internal
// @access  Private
const updateUserDonationStats = async (userId, amount, cause) => {
  try {
    const user = await User.findById(userId);
    if (user) {
      await user.updateDonationStats(amount, cause);
      await user.updateToDonor();
    }
  } catch (error) {
    console.error('User stats update error:', error);
  }
};

// @desc    Add payment method to user profile
// @route   Internal
// @access  Private
const addUserPaymentMethod = async (userId, paymentData) => {
  try {
    const user = await User.findById(userId);
    if (user) {
      await user.addPaymentMethod({
        razorpay_payment_id: paymentData.paymentId,
        method: paymentData.method,
        bank: paymentData.bank,
        wallet: paymentData.wallet
      });
    }
  } catch (error) {
    console.error('Add payment method error:', error);
  }
};

// @desc    Get donation by order ID
// @route   Internal
// @access  Private
const getDonationByOrderId = async (orderId) => {
  return await Donation.findOne({ razorpay_order_id: orderId }).populate('donor');
};

// @desc    Get user donation history
// @route   Internal
// @access  Private
const getUserDonationHistory = async (userId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    const donations = await Donation.find({ donor: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-razorpay_signature');

    const total = await Donation.countDocuments({ donor: userId });
    
    const totalAmountResult = await Donation.aggregate([
      { $match: { donor: new mongoose.Types.ObjectId(userId), status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    return {
      donations,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        totalAmount: totalAmountResult[0]?.total || 0
      }
    };
  } catch (error) {
    console.error('Get user donation history error:', error);
    throw new Error('Failed to fetch donation history');
  }
};

// @desc    Get all donations for admin
// @route   Internal
// @access  Private
const getAllDonations = async (page = 1, limit = 20, filters = {}) => {
  try {
    const skip = (page - 1) * limit;
    const matchStage = {};

    // Apply filters
    if (filters.status) matchStage.status = filters.status;
    if (filters.cause) matchStage.cause = filters.cause;
    if (filters.dateFrom || filters.dateTo) {
      matchStage.createdAt = {};
      if (filters.dateFrom) matchStage.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) matchStage.createdAt.$lte = new Date(filters.dateTo);
    }

    const donations = await Donation.find(matchStage)
      .populate('donor', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-razorpay_signature');

    const total = await Donation.countDocuments(matchStage);

    // Get statistics
    const stats = await Donation.aggregate([
      { $match: { status: 'completed', ...matchStage } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalDonations: { $sum: 1 },
          averageDonation: { $avg: '$amount' }
        }
      }
    ]);

    const causeStats = await Donation.aggregate([
      { $match: { status: 'completed', ...matchStage } },
      {
        $group: {
          _id: '$cause',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      donations,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      },
      statistics: {
        totalAmount: stats[0]?.totalAmount || 0,
        totalDonations: stats[0]?.totalDonations || 0,
        averageDonation: stats[0]?.averageDonation || 0,
        causeBreakdown: causeStats
      }
    };
  } catch (error) {
    console.error('Get all donations error:', error);
    throw new Error('Failed to fetch donations');
  }
};

// @desc    Get donation statistics for dashboard
// @route   Internal
// @access  Private
const getDonationStatistics = async () => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const [
      totalStats,
      monthlyStats,
      yearlyStats,
      recentDonations
    ] = await Promise.all([
      // Total statistics
      Donation.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalDonations: { $sum: 1 },
            uniqueDonors: { $addToSet: '$donor' }
          }
        }
      ]),
      // Monthly statistics
      Donation.aggregate([
        { 
          $match: { 
            status: 'completed',
            createdAt: { $gte: startOfMonth }
          } 
        },
        {
          $group: {
            _id: null,
            amount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      // Yearly statistics
      Donation.aggregate([
        { 
          $match: { 
            status: 'completed',
            createdAt: { $gte: startOfYear }
          } 
        },
        {
          $group: {
            _id: null,
            amount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      // Recent donations
      Donation.find({ status: 'completed' })
        .populate('donor', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('amount cause createdAt donor_info')
    ]);

    return {
      total: {
        amount: totalStats[0]?.totalAmount || 0,
        donations: totalStats[0]?.totalDonations || 0,
        donors: totalStats[0]?.uniqueDonors?.length || 0
      },
      monthly: {
        amount: monthlyStats[0]?.amount || 0,
        donations: monthlyStats[0]?.count || 0
      },
      yearly: {
        amount: yearlyStats[0]?.amount || 0,
        donations: yearlyStats[0]?.count || 0
      },
      recentDonations
    };
  } catch (error) {
    console.error('Get donation statistics error:', error);
    throw new Error('Failed to fetch donation statistics');
  }
};

// @desc    Check if Razorpay is configured
// @route   Internal
// @access  Private
const isRazorpayConfigured = () => {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && razorpay);
};

export {
  createOrder,
  verifyPaymentSignature,
  createDonationRecord,
  updateDonationStatus,
  updateUserDonationStats,
  addUserPaymentMethod,
  getDonationByOrderId,
  getUserDonationHistory,
  getAllDonations,
  getDonationStatistics,
  isRazorpayConfigured
};