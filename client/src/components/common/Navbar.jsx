// client/src/components/common/Navbar.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon,
  FolderIcon,
  UserGroupIcon,
  HandRaisedIcon,
  CurrencyDollarIcon,
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user, logout, isAuthenticated } = useAuth();
  const { userRole } = useRole();

  const handleSignOut = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const baseNavItems = [
    { name: 'Home', path: '/', icon: <HomeIcon className="h-5 w-5" /> },
    { name: 'About Us', path: '/about', icon: <InformationCircleIcon className="h-5 w-5" /> },
    { name: 'Projects', path: '/projects', icon: <FolderIcon className="h-5 w-5" /> },
    { name: 'Volunteer', path: '/volunteer', icon: <HandRaisedIcon className="h-5 w-5" /> },
    { name: 'Donation', path: '/donation', icon: <CurrencyDollarIcon className="h-5 w-5" /> },
  ];

  // Role-based navigation items
  const adminNavItems = userRole === 'admin' 
    ? [{ name: 'Admin Dashboard', path: '/admin/dashboard', icon: <ChartBarIcon className="h-5 w-5" /> }] 
    : [];
  
  const volunteerNavItems = userRole === 'volunteer' 
    ? [{ name: 'Volunteer Dashboard', path: '/volunteer/dashboard', icon: <ChartBarIcon className="h-5 w-5" /> }] 
    : [];

  const donorNavItems = userRole === 'donor' 
    ? [{ name: 'Donor Dashboard', path: '/donor/dashboard', icon: <ChartBarIcon className="h-5 w-5" /> }] 
    : [];

  const beneficiaryNavItems = userRole === 'beneficiary' 
    ? [{ name: 'Beneficiary Dashboard', path: '/beneficiary/dashboard', icon: <ChartBarIcon className="h-5 w-5" /> }] 
    : [];

  // REMOVED: userNavItems to eliminate duplicate "My Profile" from main nav
  // Profile will only be accessible via the user dropdown
  
  const navItems = [
    ...baseNavItems, 
    ...adminNavItems, 
    ...volunteerNavItems, 
    ...donorNavItems, 
    ...beneficiaryNavItems,
    // REMOVED: ...userNavItems - No more duplicate "My Profile"
  ];

  // Handle image error with proper fallback
  const handleImageError = (e) => {
    // Hide the broken image and rely on the fallback UserIcon
    e.target.style.display = 'none';
  };

  return (
    <nav className="header bg-gradient-to-r from-primary-600 to-secondary-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex-shrink-0 flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="text-white font-bold flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg">
                <div className="w-6 h-6 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-md flex items-center justify-center">
                  <span className="text-white text-xs font-bold">ES</span>
                </div>
              </div>
              <span className="text-xl tracking-tight">EduSync</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className={`${
                      location.pathname === item.path 
                        ? 'bg-primary-700 text-white' 
                        : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                    } px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-300 nav-link`}
                  >
                    <span className="mr-1">{item.icon}</span>
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              {isAuthenticated ? (
                <motion.div 
                  className="relative ml-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center justify-center p-1 rounded-full bg-primary-500 hover:bg-primary-700 text-white transition-all duration-300"
                  >
                    {user?.avatar?.url ? (
                      <img
                        src={user.avatar.url}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover border-2 border-white"
                        onError={handleImageError}
                      />
                    ) : (
                      <UserIcon className="h-5 w-5" />
                    )}
                  </button>
                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 py-2 text-xs text-gray-500 border-b">
                          Signed in as <strong>{user?.name}</strong>
                          <br />
                          Role: {userRole || 'User'}
                        </div>
                        <Link
                          to="/user/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <UserIcon className="h-4 w-4 mr-2" />
                          My Profile
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex space-x-2 ml-4"
                >
                  <Link
                    to="/auth/signin"
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-primary-600 bg-white hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/signup"
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 hover:border-white/40 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-primary-200 hover:text-white hover:bg-primary-700 focus:outline-none transition-colors duration-300"
              aria-label="Toggle menu"
              whileTap={{ scale: 0.95 }}
            >
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`${
                    location.pathname === item.path 
                      ? 'bg-primary-700 text-white' 
                      : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                  } block px-3 py-2 rounded-md text-base font-medium flex items-center transition-colors duration-300`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-primary-500">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 text-xs text-primary-200">
                      Signed in as <strong>{user?.name}</strong>
                      <br />
                      Role: {userRole || 'User'}
                    </div>
                    <Link
                      to="/user/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-primary-100 hover:bg-primary-700 hover:text-white transition-colors duration-300"
                    >
                      <UserIcon className="h-5 w-5 mr-2" />
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                      className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-primary-100 hover:bg-primary-700 hover:text-white transition-colors duration-300"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex space-x-2">
                    <Link
                      to="/auth/signin"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 text-center px-4 py-3 rounded-lg text-base font-semibold text-primary-600 bg-white hover:bg-gray-50 transition-all duration-300 shadow-md"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/auth/signup"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 text-center px-4 py-3 rounded-lg text-base font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 transition-all duration-300 shadow-md"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}