import express from 'express';
import {
  createDonationOrder,
  verifyPayment,
  getUserDonations,
  getAdminDonations,
  getStatistics,
  getDonationById,
  generateReceipt,
  getAdminStatistics
} from '../controllers/donation.controller.js';
import { isRazorpayConfigured } from '../services/paymentService.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// @desc    Check payment gateway status
// @route   GET /api/donations/status
// @access  Public
router.get('/status', (req, res) => {
  const isConfigured = isRazorpayConfigured();
  res.json({
    success: true,
    paymentGateway: {
      configured: isConfigured,
      name: 'Razorpay',
      status: isConfigured ? 'active' : 'inactive',
      message: isConfigured 
        ? 'Payment gateway is ready' 
        : 'Payment gateway is not configured. Please check environment variables.'
    }
  });
});

// @desc    Create donation order
// @route   POST /api/donations/create-order
// @access  Private
router.post('/create-order', authenticate, createDonationOrder);

// @desc    Verify payment
// @route   POST /api/donations/verify-payment
// @access  Private
router.post('/verify-payment', authenticate, verifyPayment);

// @desc    Get user donation history
// @route   GET /api/donations/my-donations
// @access  Private
router.get('/my-donations', authenticate, getUserDonations);

// @desc    Get donation statistics
// @route   GET /api/donations/statistics
// @access  Private
router.get('/statistics', authenticate, getStatistics);

// @desc    Get donation by ID
// @route   GET /api/donations/:id
// @access  Private
router.get('/:id', authenticate, getDonationById);

// @desc    Get all donations (Admin only)
// @route   GET /api/donations/admin/all
// @access  Private/Admin
router.get('/admin/all', authenticate, authorize('admin'), getAdminDonations);
router.get('/admin/statistics', authenticate, authorize('admin'), getAdminStatistics);
router.get('/:id/receipt', authenticate, generateReceipt);
export default router;