import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleBasedRoute from './RoleBasedRoute';

// Layouts
import AdminLayout from '../layouts/AdminLayout';

// Auth Pages
import SignInPage from '../pages/auth/SignInPage';
import SignUpPage from '../pages/auth/SignUpPage';

// Admin Pages (updated to match layout tabs)
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProjects from '../pages/admin/AdminProjects';
import AdminVolunteers from '../pages/admin/AdminVolunteers';
import AdminDonations from '../pages/admin/AdminDonations';
import AdminProjectDonations from '../pages/admin/AdminProjectDonations';
import AdminSettings from '../pages/admin/AdminSettings';

// Volunteer Pages
import VolunteerDashboard from '../pages/volunteer/VolunteerDashboardPage';
import Tasks from '../pages/volunteer/Tasks';
import Profile from '../pages/volunteer/Profile';
import Attendance from '../pages/volunteer/Attendance';

// Donor Pages
import DonorDashboard from '../pages/donor/DonorDashboard';
import Donate from '../pages/donor/Donate';
import History from '../pages/donor/History';
import DonorProfile from '../pages/donor/Profile';

// User Pages
import UserDashboard from '../pages/user/UserDashboard';
import Projects from '../pages/user/Projects';
import Events from '../pages/user/Events';
import UserProfile from '../pages/user/Profile';

// Public Pages
import HomePage from '../pages/public/HomePage';
import AboutPage from '../pages/public/AboutPage';
import ProjectsPage from '../pages/public/ProjectsPage';
import VolunteerPage from '../pages/public/VolunteerPage';
import BeneficiariesPage from '../pages/public/BeneficiariesPage';
import BeneficiaryApplicationPage from '../pages/public/BeneficiaryApplicationPage';

// Private Pages
import DonationPage from '../pages/private/DonationPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/volunteer" element={<VolunteerPage />} />
      <Route path="/beneficiaries" element={<BeneficiariesPage />} />
      <Route path="/projects/:projectId/apply-beneficiary" element={<BeneficiaryApplicationPage />} />
      
      {/* Auth Routes */}
      <Route path="/auth/signin" element={<SignInPage />} />
      <Route path="/auth/signup" element={<SignUpPage />} />

      {/* Private Routes - Require authentication */}
      <Route 
        path="/donation" 
        element={
          <ProtectedRoute>
            <DonationPage />
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes with Layout - Updated to match layout tabs */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="volunteers" element={<AdminVolunteers />} />
        <Route path="donations" element={<AdminDonations />} />
        <Route path="project-donations" element={<AdminProjectDonations />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Volunteer Routes */}
      <Route
        path="/volunteer/dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['volunteer', 'admin']}>
              <VolunteerDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer/tasks"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['volunteer', 'admin']}>
              <Tasks />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer/profile"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['volunteer', 'admin']}>
              <Profile />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer/attendance"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['volunteer', 'admin']}>
              <Attendance />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* Donor Routes */}
      <Route
        path="/donor/dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['donor', 'admin']}>
              <DonorDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/donor/donate"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['donor', 'admin']}>
              <Donate />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/donor/history"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['donor', 'admin']}>
              <History />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/donor/profile"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['donor', 'admin']}>
              <DonorProfile />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* User Routes */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['user', 'beneficiary', 'admin']}>
              <UserDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/projects"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['user', 'beneficiary', 'admin']}>
              <Projects />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/events"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['user', 'beneficiary', 'admin']}>
              <Events />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/profile"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['user', 'beneficiary', 'admin']}>
              <UserProfile />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;