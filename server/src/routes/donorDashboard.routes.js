import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import donorDashboardController from '../controllers/donorDashboard.controller.js';

const router = express.Router();

// All routes require authentication (donor or any authenticated user)
router.use(authenticate);

// Donor dashboard routes - GET /api/donor-dashboard
router.get('/', donorDashboardController.getDonorDashboard);

// Donor statistics - GET /api/donor-dashboard/stats
router.get('/stats', donorDashboardController.getDonorStats);

// Donor donations with pagination - GET /api/donor-dashboard/donations
router.get('/donations', donorDashboardController.getDonorDonations);

// Donor impact data - GET /api/donor-dashboard/impact
router.get('/impact', donorDashboardController.getDonorImpact);

// Donor profile - GET /api/donor-dashboard/profile
router.get('/profile', donorDashboardController.getDonorProfile);

export default router;