import express from 'express';
import multer from 'multer';
import {
  createVolunteer,
  updateVolunteer,
  getVolunteers,
  getVolunteer,
  deleteVolunteer,
  updateVolunteerStatus
} from '../controllers/volunteer.controller.js';
import { authenticate, optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
  }
  next(error);
};

// Public route - anyone can create a volunteer (no authentication required)
router.post('/', upload.single('profileImage'), handleMulterError, createVolunteer);

// Protected routes - require authentication
router.get('/', authenticate, getVolunteers);
router.get('/:id', authenticate, getVolunteer);
router.put('/:id', authenticate, upload.single('profileImage'), handleMulterError, updateVolunteer);
router.delete('/:id', authenticate, deleteVolunteer);
router.patch('/:id/status', authenticate, updateVolunteerStatus);

export default router;