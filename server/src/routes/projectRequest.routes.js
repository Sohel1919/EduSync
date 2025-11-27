import express from 'express';
import multer from 'multer';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  updateProjectStatus,
  getUserProjects,
  getAdminProjects,
  deleteRejectedProject
} from '../controllers/projectRequest.controller.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public routes
router.get('/', getProjects);
router.get('/:id', getProject);

// Protected routes
router.use(authenticate);

// User routes
router.post('/', upload.single('projectImage'), createProject);
router.get('/user/my-projects', getUserProjects);
router.put('/:id', upload.single('projectImage'), updateProject);
router.delete('/:id', deleteProject);
router.delete('/rejected/:id', deleteRejectedProject); // New route for deleting rejected projects

// Admin routes
router.patch('/:id/status', authorize('admin'), updateProjectStatus);
router.get('/admin/all-projects', authorize('admin'), getAdminProjects);

export default router;