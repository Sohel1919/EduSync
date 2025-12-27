import express from 'express';
import multer from 'multer';
import {
  createVolunteerApplication,
  getAllVolunteerApplications,
  getVolunteerApplicationById,
  getMyVolunteerApplications,
  updateApplicationStatus,
  updateInterviewDetails,
  addApplicationNote,
  getApplicationStats,
  deleteVolunteerApplication,
  exportApplications,
  getAdminDashboardStats
} from '../controllers/volunteerApplication.controller.js';
import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 10 // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and Word documents are allowed.'));
    }
  }
});

// Public routes (authenticated users only)
router.post(
  '/apply',
  authenticate,
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'idProof', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 },
    { name: 'otherDocuments', maxCount: 5 }
  ]),
  createVolunteerApplication
);

router.get('/my-applications', authenticate, getMyVolunteerApplications);
router.get('/:id', authenticate, getVolunteerApplicationById);

// Admin routes
router.get('/', authenticate, authorizeAdmin, getAllVolunteerApplications);
router.patch('/:id/status', authenticate, authorizeAdmin, updateApplicationStatus);
router.patch('/:id/interview', authenticate, authorizeAdmin, updateInterviewDetails);
router.post('/:id/notes', authenticate, authorizeAdmin, addApplicationNote);
router.get('/stats/overview', authenticate, authorizeAdmin, getApplicationStats);
router.get('/stats/dashboard', authenticate, authorizeAdmin, getAdminDashboardStats);
router.get('/export/applications', authenticate, authorizeAdmin, exportApplications);
router.delete('/:id', authenticate, authorizeAdmin, deleteVolunteerApplication);

export default router;