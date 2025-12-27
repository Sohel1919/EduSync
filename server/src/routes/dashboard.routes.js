import express from 'express';
import {
  getAdminDashboard,
  getBeneficiaryDashboard,
  getDonorDashboard,
  getUserStatistics
} from '../controllers/dashboard.controller.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticate);

// Get dashboard data based on user role
router.get('/my-dashboard', (req, res, next) => {
  switch (req.user.role) {
    case 'admin':
      return getAdminDashboard(req, res, next);
    case 'beneficiary':
      return getBeneficiaryDashboard(req, res, next);
    case 'donor':
      return getDonorDashboard(req, res, next);
    default:
      return res.status(403).json({
        success: false,
        message: 'No dashboard available for your role'
      });
  }
});

// Role-specific dashboard endpoints
router.get('/admin', authorize('admin'), getAdminDashboard);
router.get('/beneficiary', authorize('beneficiary'), getBeneficiaryDashboard);
router.get('/donor', authorize('donor'), getDonorDashboard);

// Get user statistics
router.get('/statistics', getUserStatistics);

export default router;