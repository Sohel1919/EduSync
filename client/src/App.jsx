// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { RoleProvider } from "./context/RoleContext";
import './index.css';

// Public pages (no authentication required)
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage'; // Add this import
import UnauthorizedPage from './pages/public/UnauthorizedPage';
import ProjectsPage from './pages/public/ProjectsPage';
import VolunteerPage from './pages/public/VolunteerPage';
import BeneficiariesPage from './pages/public/BeneficiariesPage';
import BeneficiaryApplicationPage from './pages/public/BeneficiaryApplicationPage';

// Private pages (require authentication, any role)
import DonationPage from './pages/private/DonationPage';

// Role-specific pages (require specific roles)
import AdminDashboard from './pages/admin/AdminDashboard';
import VolunteerDashboardPage from './pages/volunteer/VolunteerDashboardPage';
import DonorDashboard from './pages/donor/DonorDashboard';
import UserDashboard from './pages/user/UserDashboard';
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
    '/verify-email'
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
                <Route path="/reset-password" element={<ResetPasswordPage />} /> {/* Add this route */}
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/volunteer" element={<VolunteerPage />} />
                <Route path="/beneficiaries" element={<BeneficiariesPage />} />
                <Route path="/projects/:projectId/apply-beneficiary" element={<BeneficiaryApplicationPage />} />
                
                {/* Private Routes - Require authentication (any role) */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/donation" 
                  element={
                    <ProtectedRoute>
                      <DonationPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* User Profile Route */}
                <Route 
                  path="/user/profile" 
                  element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Role-specific Routes - Require specific roles */}
                <Route 
                  path="/admin/*" 
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/volunteer/dashboard" 
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={['volunteer']}>
                        <VolunteerDashboardPage />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/donor/dashboard" 
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={['donor']}>
                        <DonorDashboard />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  } 
                />
                
                {/* User dashboard for regular users */}
                <Route 
                  path="/user/dashboard" 
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={['user']}>
                        <UserDashboard />
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