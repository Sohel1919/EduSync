import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { RoleProvider } from "./context/RoleContext";
import './index.css';

// Layouts
import AdminLayout from './layouts/AdminLayout';

// Public pages (no authentication required)
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import UnauthorizedPage from './pages/public/UnauthorizedPage';
import ProjectsPage from './pages/public/ProjectsPage';
import VolunteerPage from './pages/public/VolunteerPage';
import BeneficiariesPage from './pages/public/BeneficiariesPage';
import BeneficiaryApplicationPage from './pages/public/BeneficiaryApplicationPage';

// Private pages (require authentication, any role)
import DonationPage from './pages/private/DonationPage';

// Admin pages (matching your layout tabs)
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProjects from './pages/admin/AdminProjects';
import AdminVolunteers from './pages/admin/AdminVolunteers';
import AdminDonations from './pages/admin/AdminDonations';
import AdminProjectDonations from './pages/admin/AdminProjectDonations';
import AdminSettings from './pages/admin/AdminSettings';

// Volunteer pages
import VolunteerDashboardPage from './pages/volunteer/VolunteerDashboardPage';
import Tasks from './pages/volunteer/Tasks';
import Profile from './pages/volunteer/Profile';
import Attendance from './pages/volunteer/Attendance';

// Donor pages
import DonorDashboard from './pages/donor/DonorDashboard';
import Donate from './pages/donor/Donate';
import History from './pages/donor/History';
import DonorProfile from './pages/donor/Profile';

// User pages
import UserDashboard from './pages/user/UserDashboard';
import UserProjects from './pages/user/Projects';
import UserEvents from './pages/user/Events';
import UserProfile from './pages/user/Profile';

// Components
import ProtectedRoute from './routes/ProtectedRoute';
import RoleBasedRoute from './routes/RoleBasedRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Simple 404 page
const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="text-center">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
        404 - Page Not Found
      </h1>
      <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
      <a 
        href="/" 
        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
      >
        Go Home
      </a>
    </div>
  </div>
);

// Component to conditionally render footer
const Layout = ({ children }) => {
  const location = useLocation();
  
  // List of routes where footer should be hidden
  const hideFooterRoutes = [
    '/auth/signin',
    '/auth/signup',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/admin',
    '/volunteer',
    '/donor',
    '/user'
  ];

  const shouldShowFooter = !hideFooterRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      {shouldShowFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RoleProvider>
          <Router>
            <Layout>
              <Routes>
                {/* Public Routes - No authentication required */}
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/auth/signin" element={<SignInPage />} />
                <Route path="/auth/signup" element={<SignUpPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/volunteer" element={<VolunteerPage />} />
                <Route path="/beneficiaries" element={<BeneficiariesPage />} />
                <Route path="/projects/:projectId/apply-beneficiary" element={<BeneficiaryApplicationPage />} />
                
                {/* Private Routes - Require authentication (any role) */}
                <Route 
                  path="/donation" 
                  element={
                    <ProtectedRoute>
                      <DonationPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Admin Routes with Layout */}
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
                        <VolunteerDashboardPage />
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
                        <UserProjects />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/user/events" 
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={['user', 'beneficiary', 'admin']}>
                        <UserEvents />
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
                
                {/* 404 Catch All */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                },
                success: {
                  style: {
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  },
                  iconTheme: {
                    primary: '#fff',
                    secondary: '#10B981',
                  },
                },
                error: {
                  style: {
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  },
                  iconTheme: {
                    primary: '#fff',
                    secondary: '#EF4444',
                  },
                },
                loading: {
                  style: {
                    background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                  },
                },
              }}
            />
          </Router>
        </RoleProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;