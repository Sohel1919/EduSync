import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { RoleProvider } from "./context/RoleContext";
import './index.css';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

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
import Loader from './components/common/Loader';

// Private pages (require authentication, any role)
import DonationPage from './pages/private/DonationPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProjects from './pages/admin/AdminProjects';
import AdminVolunteers from './pages/admin/AdminVolunteers';
import AdminDonations from './pages/admin/AdminDonations';
import AdminProjectDonations from './pages/admin/AdminProjectDonations';
import AdminSettings from './pages/admin/AdminSettings';

// Volunteer pages
import VolunteerDashboardPage from './pages/volunteer/VolunteerDashboardPage';
import Projects from './pages/volunteer/Projects';
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

// Icons for navigation
import { 
  HomeIcon,
  FolderIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  CalendarIcon,
  TrophyIcon,
  HeartIcon,
  DocumentTextIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

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

// Component to conditionally render navbar and footer
const Layout = ({ children }) => {
  const location = useLocation();
  
  // List of routes where navbar should be hidden
  const hideNavbarRoutes = [
    '/auth/signin',
    '/auth/signup',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
  ];

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

  const shouldShowNavbar = !hideNavbarRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  const shouldShowFooter = !hideFooterRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {shouldShowNavbar && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {shouldShowFooter && <Footer />}
    </div>
  );
};

// Navigation configurations for different roles
const adminNavigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Projects', href: '/admin/projects', icon: FolderIcon },
  { name: 'Volunteers', href: '/admin/volunteers', icon: UserGroupIcon },
  { name: 'Donations', href: '/admin/donations', icon: CurrencyDollarIcon },
  { name: 'Project Donations', href: '/admin/project-donations', icon: ChartBarIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

const volunteerNavigation = [
  { name: 'Dashboard', href: '/volunteer/dashboard', icon: HomeIcon },
  { name: 'Projects', href: '/volunteer/projects', icon: CheckCircleIcon },
  { name: 'Attendance', href: '/volunteer/attendance', icon: CalendarIcon },
  { name: 'Profile', href: '/volunteer/profile', icon: UserGroupIcon },
];

const donorNavigation = [
  { name: 'Dashboard', href: '/donor/dashboard', icon: HomeIcon },
  { name: 'Donate', href: '/donor/donate', icon: CurrencyDollarIcon },
  { name: 'History', href: '/donor/history', icon: ChartBarIcon },
  { name: 'Profile', href: '/donor/profile', icon: UserGroupIcon },
];

const userNavigation = [
  { name: 'Dashboard', href: '/user/dashboard', icon: HomeIcon },
  { name: 'Projects', href: '/user/projects', icon: FolderIcon },
  { name: 'Events', href: '/user/events', icon: CalendarIcon },
  { name: 'Profile', href: '/user/profile', icon: UserGroupIcon },
];

const beneficiaryNavigation = [
  { name: 'Dashboard', href: '/user/dashboard', icon: HomeIcon },
  { name: 'Projects', href: '/user/projects', icon: FolderIcon },
  { name: 'Events', href: '/user/events', icon: CalendarIcon },
  { name: 'Profile', href: '/user/profile', icon: UserGroupIcon },
];

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
                <Route path="/loader" element={<Loader />} />
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
                
                {/* Admin Routes with DashboardLayout */}
                <Route 
                  path="/admin/*" 
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={['admin']}>
                        <DashboardLayout 
                          userRole="admin"
                          userName="Admin User"
                          userEmail="admin@caresync.org"
                          navigationItems={adminNavigation}
                          dashboardTitle="Admin Dashboard"
                          stats={[
                            { label: 'Total Users', value: '1,234' },
                            { label: 'Active Projects', value: '45' },
                            { label: 'This Month', value: '$12.5K' }
                          ]}
                          logoHref="/admin/dashboard"
                        />
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
                
                {/* Volunteer Routes with DashboardLayout */}
                <Route 
                  path="/volunteer/*" 
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={['volunteer', 'admin']}>
                        <DashboardLayout 
                          userRole="volunteer"
                          userName="Volunteer User"
                          userEmail="volunteer@caresync.org"
                          navigationItems={volunteerNavigation}
                          dashboardTitle="Volunteer Dashboard"
                          stats={[
                            { label: 'Hours This Week', value: '12.5h' },
                            { label: 'Completed Tasks', value: '8' },
                            { label: 'Active Projects', value: '3' }
                          ]}
                          logoHref="/volunteer/dashboard"
                        />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  } 
                >
                  <Route path="dashboard" element={<VolunteerDashboardPage />} />
                  <Route path="projects" element={<Projects />} />
                  <Route path="attendance" element={<Attendance />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
                
                {/* Donor Routes with DashboardLayout */}
                <Route 
                  path="/donor/*" 
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={['donor', 'admin']}>
                        <DashboardLayout 
                          userRole="donor"
                          userName="Donor User"
                          userEmail="donor@caresync.org"
                          navigationItems={donorNavigation}
                          dashboardTitle="Donor Dashboard"
                          stats={[
                            { label: 'Total Donated', value: '$2,540' },
                            { label: 'Projects Supported', value: '7' },
                            { label: 'This Year', value: '$1,200' }
                          ]}
                          logoHref="/donor/dashboard"
                        />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  } 
                >
                  <Route path="dashboard" element={<DonorDashboard />} />
                  <Route path="donate" element={<Donate />} />
                  <Route path="history" element={<History />} />
                  <Route path="profile" element={<DonorProfile />} />
                </Route>
                
                {/* User/Beneficiary Routes with DashboardLayout */}
                <Route 
                  path="/user/*" 
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={['user', 'beneficiary', 'admin']}>
                        <DashboardLayout 
                          userRole="user"
                          userName="User"
                          userEmail="user@caresync.org"
                          navigationItems={userNavigation}
                          dashboardTitle="User Dashboard"
                          stats={[
                            { label: 'Active Applications', value: '2' },
                            { label: 'Approved Projects', value: '1' },
                            { label: 'Support Received', value: '3' }
                          ]}
                          logoHref="/user/dashboard"
                        />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  } 
                >
                  <Route path="dashboard" element={<UserDashboard />} />
                  <Route path="projects" element={<UserProjects />} />
                  <Route path="events" element={<UserEvents />} />
                  <Route path="profile" element={<UserProfile />} />
                </Route>
                
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