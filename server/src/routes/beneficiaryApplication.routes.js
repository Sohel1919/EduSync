// routes/beneficiary.routes.js (add these routes)
import express from 'express';
import {
  createBeneficiaryApplication,
  getProjectBeneficiaries,
  getUserBeneficiaries,
  updateBeneficiaryStatus,
  getBeneficiaryById,
  deleteBeneficiaryApplication,
  getAllBeneficiaryApplications,
  bulkUpdateBeneficiaryStatus,
  getVolunteerProjectBeneficiaries
} from '../controllers/beneficiaryApplication.controller.js';
import {
  getBeneficiaryDashboard,
  getBeneficiaryStats,
  getBeneficiaryProjects
} from '../controllers/beneficiaryDashboard.controller.js'; // NEW
import { authenticate } from '../middlewares/authMiddleware.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, JPG, and PDF files are allowed.'), false);
    }
  }
});

// File upload configuration for multiple document types
const uploadFields = upload.fields([
  { name: 'idProof', maxCount: 1 },
  { name: 'addressProof', maxCount: 1 },
  { name: 'incomeProof', maxCount: 1 },
  { name: 'medicalProof', maxCount: 1 },
  { name: 'otherDocuments', maxCount: 5 }
]);

// Apply authentication to all routes
router.use(authenticate);

// BENEFICIARY DASHBOARD ROUTES (NEW) - Add these before other routes
router.get('/dashboard', getBeneficiaryDashboard);
router.get('/dashboard/stats', getBeneficiaryStats);
router.get('/dashboard/projects', getBeneficiaryProjects); // For filtering and pagination

// Create beneficiary application
router.post('/applications', uploadFields, createBeneficiaryApplication);

// Get user's beneficiary applications
router.get('/my-applications', getUserBeneficiaries);

// Get beneficiary applications for a project (project creator only)
router.get('/project/:projectId', getProjectBeneficiaries);

// Get single beneficiary application
router.get('/:beneficiaryId', getBeneficiaryById);

// Update beneficiary application status (project creator only)
router.patch('/:beneficiaryId/status', updateBeneficiaryStatus);

// Delete beneficiary application (applicant only)
router.delete('/:beneficiaryId', deleteBeneficiaryApplication);

// VOLUNTEER ROUTES - Get beneficiary applications for volunteer's projects
router.get('/volunteer/my-projects/applications', getVolunteerProjectBeneficiaries);

// ADMIN ROUTES
// Get all beneficiary applications (Admin only)
router.get('/admin/applications', getAllBeneficiaryApplications);

// Bulk update beneficiary application status (Admin only)
router.patch('/admin/bulk-status', bulkUpdateBeneficiaryStatus);

export default router;