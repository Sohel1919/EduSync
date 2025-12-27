import {
  createOrder,
  verifyPaymentSignature,
  createDonationRecord,
  updateDonationStatus,
  getUserDonationHistory,
  getAllDonations,
  getDonationStatistics,
  isRazorpayConfigured
} from '../services/paymentService.js';
import Donation from '../models/donation.model.js';
import { 
  emitDonationReceived, 
  emitDonationConfirmation,
  emitDonationStatsUpdate 
} from '../utils/socket.js';

// @desc    Create education donation order
// @route   POST /api/donations/create-order
// @access  Private
const createDonationOrder = async (req, res) => {
  try {
    // Check if Razorpay is configured
    if (!isRazorpayConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Payment gateway is currently unavailable. Please try again later.'
      });
    }

    const { amount, cause, causeName, donorInfo } = req.body;
    const userId = req.user._id;

    // Validate amount
    if (!amount || amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be at least ₹100'
      });
    }

    // Create Razorpay order
    const order = await createOrder(amount);

    // Create education donation record
    const donationData = {
      donor: userId,
      amount: amount,
      cause: cause,
      causeName: causeName,
      razorpay_order_id: order.id,
      donor_info: donorInfo,
      status: 'pending'
    };

    await createDonationRecord(donationData);

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      },
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Create education donation order error:', error);
    
    if (error.message.includes('Razorpay payment gateway is not configured')) {
      return res.status(503).json({
        success: false,
        message: 'Payment gateway is currently unavailable. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create education donation order'
    });
  }
};

// @desc    Verify education donation payment
// @route   POST /api/donations/verify-payment
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      method,
      bank,
      wallet
    } = req.body;

    // Verify payment signature
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      await updateDonationStatus(razorpay_order_id, 'failed');
      return res.status(400).json({
        success: false,
        message: 'Education donation payment verification failed'
      });
    }

    // Get donation before updating to use in receipt generation
    const existingDonation = await Donation.findOne({ razorpay_order_id });

    // Update donation status to completed
    const paymentData = {
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      method: method,
      bank: bank,
      wallet: wallet,
      donationId: existingDonation._id,
      donorInfo: existingDonation.donor_info,
      donation: existingDonation.toObject()
    };

    const donation = await updateDonationStatus(
      razorpay_order_id,
      'completed',
      paymentData
    );

    // Emit real-time updates via Socket.io
    try {
      // Emit to admin room
      emitDonationReceived({
        donationId: donation._id,
        amount: donation.amount,
        cause: donation.causeName,
        donorName: donation.donor_info.isAnonymous ? 'Anonymous Education Supporter' : donation.donor_info.name,
        timestamp: new Date()
      });

      // Emit confirmation to user
      if (!donation.donor_info.isAnonymous) {
        emitDonationConfirmation(donation.donor._id.toString(), {
          donationId: donation._id,
          amount: donation.amount,
          cause: donation.causeName,
          receipt_url: donation.receipt_url,
          timestamp: new Date()
        });
      }

      // Emit updated statistics to admin room
      const stats = await getDonationStatistics();
      emitDonationStatsUpdate(stats);

    } catch (socketError) {
      console.error('Socket emission error:', socketError);
      // Don't fail the request if socket emission fails
    }

    res.json({
      success: true,
      message: 'Education donation payment verified successfully',
      donation: {
        id: donation._id,
        amount: donation.amount,
        cause: donation.causeName,
        receipt_url: donation.receipt_url
      }
    });

  } catch (error) {
    console.error('Education donation payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Education donation payment verification failed'
    });
  }
};

// @desc    Get user education donation history
// @route   GET /api/donations/my-donations
// @access  Private
const getUserDonations = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const history = await getUserDonationHistory(userId, page, limit);

    res.json({
      success: true,
      ...history
    });

  } catch (error) {
    console.error('Get user education donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch education donation history'
    });
  }
};

// @desc    Get all education donations (Admin only)
// @route   GET /api/donations/admin/all
// @access  Private/Admin
const getAdminDonations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {
      status: req.query.status,
      cause: req.query.cause,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo
    };

    const result = await getAllDonations(page, limit, filters);

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Get all education donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch education donations'
    });
  }
};

// @desc    Get education donation statistics
// @route   GET /api/donations/statistics
// @access  Private
const getStatistics = async (req, res) => {
  try {
    console.log('Fetching education donation statistics...');

    // Get basic counts
    const [totalDonations, completedDonations, pendingDonations, failedDonations] = await Promise.all([
      Donation.countDocuments(),
      Donation.countDocuments({ status: 'completed' }),
      Donation.countDocuments({ status: 'pending' }),
      Donation.countDocuments({ status: 'failed' })
    ]);

    // Calculate total amount from completed donations
    const totalAmountResult = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;

    // Get payment method distribution
    const paymentMethods = await Donation.aggregate([
      { $match: { status: 'completed', payment_method: { $exists: true, $ne: null } } },
      { 
        $group: { 
          _id: '$payment_method', 
          count: { $sum: 1 }, 
          amount: { $sum: '$amount' } 
        } 
      },
      { $match: { _id: { $ne: null } } },
      { $sort: { count: -1 } }
    ]);

    // Get last 6 months data for chart
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Donation.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get education program distribution
    const causeDistribution = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { 
        $group: { 
          _id: '$cause', 
          count: { $sum: 1 }, 
          amount: { $sum: '$amount' } 
        } 
      },
      { $sort: { amount: -1 } }
    ]);

    // Format response
    const response = {
      success: true,
      statistics: {
        total: totalDonations,
        completed: completedDonations,
        pending: pendingDonations,
        failed: failedDonations,
        totalAmount: totalAmount,
        recurring: 0,
        paymentMethods: paymentMethods.length > 0 ? paymentMethods : getDefaultPaymentMethods(),
        monthlyData: monthlyData.length > 0 ? monthlyData : getDefaultMonthlyData(),
        causeDistribution: causeDistribution
      }
    };

    console.log('Education donation statistics response prepared');
    res.json(response);

  } catch (error) {
    console.error('Get education donation statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch education donation statistics',
      error: error.message
    });
  }
};

// Helper functions for default data
const getDefaultPaymentMethods = () => {
  return [
    { _id: 'upi', count: 0, amount: 0 },
    { _id: 'card', count: 0, amount: 0 },
    { _id: 'netbanking', count: 0, amount: 0 }
  ];
};

const getDefaultMonthlyData = () => {
  const currentDate = new Date();
  const data = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(currentDate.getMonth() - i);
    data.push({
      _id: { year: date.getFullYear(), month: date.getMonth() + 1 },
      amount: 0,
      count: 0
    });
  }
  
  return data;
};

// @desc    Get education donation by ID
// @route   GET /api/donations/:id
// @access  Private
const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email phone')
      .select('-razorpay_signature');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Education donation not found'
      });
    }

    // Check if user is authorized to view this donation
    if (req.user.role !== 'admin' && donation.donor._id.toString() !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      donation
    });

  } catch (error) {
    console.error('Get education donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch education donation'
    });
  }
};

const getAdminStatistics = async (req, res) => {
  try {
    const { timeframe = '30days' } = req.query;
    
    // Calculate date range based on timeframe
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default: // 30 days
        startDate.setDate(now.getDate() - 30);
    }

    // Get total statistics
    const totalDonations = await Donation.countDocuments();
    const completedDonations = await Donation.countDocuments({ status: 'completed' });
    const pendingDonations = await Donation.countDocuments({ status: 'pending' });
    const failedDonations = await Donation.countDocuments({ status: 'failed' });
    
    // Calculate total amount from completed donations
    const totalAmountResult = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalAmount = totalAmountResult[0]?.total || 0;

    // Calculate recurring education donations
    const recurringDonations = await Donation.countDocuments({ 
      status: 'completed',
    });

    // Get payment method distribution
    const paymentMethods = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$payment_method', count: { $sum: 1 }, amount: { $sum: '$amount' } } }
    ]);

    // Get monthly education donation data for chart
    const monthlyData = await Donation.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get education program distribution
    const causeDistribution = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$cause', count: { $sum: 1 }, amount: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      statistics: {
        total: totalDonations,
        completed: completedDonations,
        pending: pendingDonations,
        failed: failedDonations,
        totalAmount,
        recurring: recurringDonations,
        paymentMethods,
        monthlyData,
        causeDistribution
      }
    });

  } catch (error) {
    console.error('Get admin education donation statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch education donation statistics'
    });
  }
};

// @desc    Generate education donation receipt
// @route   GET /api/donations/:id/receipt
// @access  Private
const generateReceipt = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email phone')
      .select('-razorpay_signature');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Education donation not found'
      });
    }

    // Check if user is authorized to view this receipt
    if (req.user.role !== 'admin' && donation.donor._id.toString() !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Generate education receipt data
    const receiptData = {
      receiptId: `EDU-${donation._id.toString().slice(-8).toUpperCase()}`,
      donationId: donation._id,
      donorName: donation.donor_info?.name || donation.donor.name,
      donorEmail: donation.donor_info?.email || donation.donor.email,
      amount: donation.amount,
      currency: donation.currency,
      cause: donation.causeName,
      paymentMethod: donation.payment_method,
      transactionId: donation.razorpay_payment_id,
      orderId: donation.razorpay_order_id,
      date: donation.createdAt,
      status: donation.status,
      isAnonymous: donation.donor_info?.isAnonymous || false
    };

    res.json({
      success: true,
      receipt: receiptData,
      downloadUrl: `/api/donations/${donation._id}/receipt/pdf`
    });

  } catch (error) {
    console.error('Generate education donation receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate education donation receipt'
    });
  }
};

export {
  createDonationOrder,
  verifyPayment,
  getUserDonations,
  getAdminDonations,
  getStatistics,
  getDonationById,
  generateReceipt,
  getAdminStatistics,
  getAllDonations,
};