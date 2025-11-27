import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  ChevronDownIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  UserIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../services/apiService';

// Default navigation items - can be overridden via props
const defaultNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: true },
  { name: 'Projects', href: '/projects', icon: DocumentTextIcon, current: false },
  { name: 'Profile', href: '/profile', icon: UserIcon, current: false },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, current: false },
];

export default function DashboardLayout({
  userRole = 'volunteer',
  userName = 'Volunteer',
  userEmail = 'volunteer@caresync.org',
  navigationItems = defaultNavigation,
  dashboardTitle = 'Volunteer Dashboard',
  showStats = false,
  stats = [],
  customHeader = null,
  logoHref = '/'
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const notificationsRef = useRef(null);
  const { user } = useAuth();

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      setNotificationsLoading(true);
      setNotificationsError(null);
      try {
        const response = await notificationsAPI.get({
          page: 1,
          limit: 20,
          unreadOnly: false
        });
        
        if (response.data.success) {
          setNotifications(response.data.data.notifications || []);
        } else {
          throw new Error(response.data.message || 'Failed to fetch notifications');
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotificationsError(error.response?.data?.message || 'Failed to load notifications');
        // Fallback to empty array
        setNotifications([]);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();

    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Update navigation items based on current route
  const updatedNavigation = navigationItems.map(item => ({
    ...item,
    current: location.pathname === item.href || location.pathname.startsWith(item.href + '/')
  }));

  // Role-based colors and icons
  const roleConfig = {
    admin: {
      gradient: 'from-primary-600 to-secondary-600',
      lightGradient: 'from-primary-500 to-secondary-600',
      badge: 'Administrator',
      icon: 'A'
    },
    volunteer: {
      gradient: 'from-primary-600 to-secondary-600',
      lightGradient: 'from-primary-500 to-secondary-600',
      badge: 'Volunteer',
      icon: 'V'
    },
    donor: {
      gradient: 'from-primary-600 to-secondary-600',
      lightGradient: 'from-primary-500 to-secondary-600',
      badge: 'Donor',
      icon: 'D'
    },
    beneficiary: {
      gradient: 'from-primary-600 to-secondary-600',
      lightGradient: 'from-primary-500 to-secondary-600',
      badge: 'Beneficiary',
      icon: 'B'
    },
    user: {
      gradient: 'from-primary-600 to-secondary-600',
      lightGradient: 'from-primary-500 to-secondary-600',
      badge: 'User',
      icon: 'U'
    }
  };

  const config = roleConfig[userRole] || roleConfig.user;

  // Notification functions
  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      
      // Update local state optimistically
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert optimistic update on error
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: false }
            : notification
        )
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      
      // Update local state optimistically
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationsAPI.delete(notificationId);
      
      // Update local state optimistically
      setNotifications(prev => 
        prev.filter(notification => notification._id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'beneficiary_application':
        return <UserIcon className="h-5 w-5 text-blue-500" />;
      case 'application_status_update':
        return <DocumentTextIcon className="h-5 w-5 text-primary-500" />;
      case 'project_update':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'volunteer_application':
        return <UserIcon className="h-5 w-5 text-purple-500" />;
      case 'system':
        return <Cog6ToothIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'beneficiary_application':
        return 'bg-blue-50 border-blue-200';
      case 'application_status_update':
        return 'bg-primary-50 border-primary-200';
      case 'project_update':
        return 'bg-green-50 border-green-200';
      case 'volunteer_application':
        return 'bg-purple-50 border-purple-200';
      case 'system':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read when clicked
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    
    setNotificationsOpen(false);
    
    // Navigate based on notification type and data
    if (notification.data?.projectId) {
      navigate(`/projects/${notification.data.projectId}`);
    } else if (notification.data?.beneficiaryId) {
      navigate(`/beneficiaries/${notification.data.beneficiaryId}`);
    } else if (notification.data?.volunteerId) {
      navigate(`/volunteers/${notification.data.volunteerId}`);
    }
    // Add more navigation logic based on your app's routes
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notificationDate = new Date(timestamp);
    const diffInHours = (now - notificationDate) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return notificationDate.toLocaleDateString();
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for mobile */}
      <div className={`fixed inset-0 flex z-50 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <Link to={logoHref} className="text-2xl font-bold text-primary-600">
                CareSync
              </Link>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {updatedNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`${
                      item.current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-4 flex-shrink-0 h-6 w-6`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Link to={logoHref} className="text-2xl font-bold text-primary-600">
                CareSync
              </Link>
            </div>
            <nav className="mt-8 flex-1 px-4 bg-white space-y-2">
              {updatedNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-3 py-3 text-sm font-medium rounded-lg border-l-4 transition-colors duration-200`}
                >
                  <item.icon
                    className={`${
                      item.current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-5 w-5`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top header */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              {/* Go Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors duration-200 mr-4"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Go Back
              </button>
              
              {/* Search */}
              <div className="max-w-lg w-full lg:max-w-xs">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Search..."
                    type="search"
                  />
                </div>
              </div>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button 
                  className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 relative"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  disabled={notificationsLoading}
                >
                  <BellIcon className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  {notificationsLoading && (
                    <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-1 border-white"></div>
                    </span>
                  )}
                </button>

                {/* Notifications Panel */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        <div className="flex items-center space-x-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                              disabled={notificationsLoading}
                            >
                              Mark all as read
                            </button>
                          )}
                          <Link
                            to="/notifications"
                            className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                            onClick={() => setNotificationsOpen(false)}
                          >
                            View all
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notificationsLoading ? (
                        <div className="p-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
                        </div>
                      ) : notificationsError ? (
                        <div className="p-4 text-center text-red-600">
                          <ExclamationTriangleIcon className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">{notificationsError}</p>
                          <button
                            onClick={() => window.location.reload()}
                            className="mt-2 text-sm text-primary-600 hover:text-primary-800"
                          >
                            Retry
                          </button>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <BellIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <p className="text-sm">No notifications yet</p>
                          <p className="text-xs mt-1">We'll notify you when something important happens</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 cursor-pointer ${
                              !notification.isRead ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className={`text-sm font-medium ${
                                    !notification.isRead ? 'text-gray-900 font-semibold' : 'text-gray-900'
                                  }`}>
                                    {notification.title}
                                  </p>
                                  {!notification.isRead && (
                                    <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <p className="text-xs text-gray-400">
                                    {formatTimestamp(notification.createdAt)}
                                  </p>
                                  {notification.priority === 'high' && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                      Important
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification._id);
                                }}
                                className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete notification"
                                disabled={notificationsLoading}
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {notifications.length > 0 && !notificationsLoading && !notificationsError && (
                      <div className="p-4 border-t border-gray-200">
                        <Link
                          to="/notifications"
                          className="block text-center text-sm text-primary-600 hover:text-primary-800 font-medium"
                          onClick={() => setNotificationsOpen(false)}
                        >
                          View all notifications
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dashboard Title */}
              <div className="hidden sm:flex items-center">
                <span className="text-lg font-semibold text-gray-900 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  {dashboardTitle}
                </span>
              </div>

              {/* Custom Header */}
              {customHeader}

              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div className="flex items-center space-x-3 cursor-pointer">
                  <div className="flex-shrink-0">
                    <div className={`h-8 w-8 rounded-full bg-gradient-to-r ${config.lightGradient} flex items-center justify-center`}>
                      <span className="text-white text-sm font-medium">{config.icon}</span>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="text-sm font-medium text-gray-900">{userName}</div>
                    <div className="text-xs text-gray-500 capitalize">{config.badge}</div>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}