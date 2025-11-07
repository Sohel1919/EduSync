import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import ProtectedRoute from './ProtectedRoute';
import RoleBasedRoute from './RoleBasedRoute';

// Auth Pages
import SignInPage from '../pages/auth/SignInPage';
import SignUpPage from '../pages/auth/SignUpPage';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import ManageUsers from '../pages/admin/ManageUsers';
import ManageDonations from '../pages/admin/ManageDonations';
import Reports from '../pages/admin/Reports';

// Volunteer Pages
import VolunteerDashboard from '../pages/volunteer/Dashboard';
import Tasks from '../pages/volunteer/Tasks';
import Profile from '../pages/volunteer/Profile';
import Attendance from '../pages/volunteer/Attendance';

// Donor Pages
import DonorDashboard from '../pages/donor/Dashboard';
import Donate from '../pages/donor/Donate';
import History from '../pages/donor/History';
import DonorProfile from '../pages/donor/Profile';

// User Pages
import UserDashboard from '../pages/user/Dashboard';
import Projects from '../pages/user/Projects';
import Events from '../pages/user/Events';
import UserProfile from '../pages/user/Profile';

// Public Pages
import HomePage from '../pages/HomePage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      
      {/* Auth Routes */}
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />

      {/* Protected Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['admin']}>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="donations" element={<ManageDonations />} />
                <Route path="reports" element={<Reports />} />
              </Routes>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/volunteer/*"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['volunteer', 'admin']}>
              <Routes>
                <Route path="dashboard" element={<VolunteerDashboard />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="profile" element={<Profile />} />
                <Route path="attendance" element={<Attendance />} />
              </Routes>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/donor/*"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['donor', 'admin']}>
              <Routes>
                <Route path="dashboard" element={<DonorDashboard />} />
                <Route path="donate" element={<Donate />} />
                <Route path="history" element={<History />} />
                <Route path="profile" element={<DonorProfile />} />
              </Routes>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/*"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['user', 'beneficiary', 'admin']}>
              <Routes>
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="projects" element={<Projects />} />
                <Route path="events" element={<Events />} />
                <Route path="profile" element={<UserProfile />} />
              </Routes>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;