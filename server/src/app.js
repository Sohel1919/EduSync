import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/project.routes.js';
import volunteerRoutes from './routes/volunteer.routes.js';
import beneficiaryApplicationRoutes from './routes/beneficiaryApplication.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import projectRequestRoutes from './routes/projectRequest.routes.js';
import donationRoutes from './routes/donation.routes.js';
import donorDashboardRoutes from './routes/donorDashboard.routes.js';
import volunteerApplicationRoutes from './routes/volunteerApplication.routes.js';

const app = express();

// Middleware
app.use(helmet());

const allowedOrigins = [
  'https://edu-sync-two-zeta.vercel.app', 
  'http://localhost:5173',                 
];


app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("CORS Blocked for origin:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/beneficiaries', beneficiaryApplicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/project-requests', projectRequestRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/donor-dashboard', donorDashboardRoutes);
app.use('/api/volunteer-applications', volunteerApplicationRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

export default app;