import express from 'express';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getUserProjects,
  getAdminProjects,
  getAllProjects
} from '../controllers/project.controller.js';
import { authenticate } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

// Public routes
router.get('/', getProjects);
router.get('/:id', getProject);

// Protected routes - use authenticate instead of protect
router.use(authenticate); // This applies to all routes below

router.post('/', createProject);
router.get('/user/my-projects', getUserProjects);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);


router.get('/admin/all-projects', getAdminProjects); // For admin panel with filters
router.get('/admin/complete-stats', getAllProjects); 

export default router;