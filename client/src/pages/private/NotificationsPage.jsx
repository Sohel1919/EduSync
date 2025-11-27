import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  ChevronLeftIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
    UserIcon, 
  DocumentTextIcon,
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';
import { notificationsAPI } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();
  const { user } = useAuth();

  const notificationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'beneficiary_application', label: 'Beneficiary Applications' },
    { value: 'application_status_update', label: 'Status Updates' },
    { value: 'project_update', label: 'Project Updates' },
    { value: 'volunteer_application', label: 'Volunteer Applications' },
    { value: 'system', label: 'System' }
  ];

  const statusFilters = [
    { value: 'all', label: 'All Notifications' },
    { value: 'unread', label: 'Unread Only' },
    { value: 'read', label: 'Read Only' }
  ];

  // Fetch notifications
  const fetchNotifications = async (pageNum = 1, append = false) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pageNum,
        limit: 20,
        ...(filter !== 'all' && { unreadOnly: filter === 'unread' }),
        ...(typeFilter !== 'all' && { type: typeFilter })
      };

      const response = await notificationsAPI.get(params);
      
      if (response.data.success) {
        const newNotifications = response.data.data.notifications || [];
        const total = response.data.data.total || 0;
        const unread = response.data.data.unreadCount || 0;

        if (append) {
          setNotifications(prev => [...prev, ...newNotifications]);
        } else {
          setNotifications(newNotifications);
        }

        setFilteredNotifications(append ? [...notifications, ...newNotifications] : newNotifications);
        setTotalCount(total);
        setUnreadCount(unread);
        setHasMore(newNotifications.length === 20); // Assuming limit is 20
        setPage(pageNum);
      } else {
        throw new Error(response.data.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1, false);
  }, [user, filter, typeFilter]);

  // Search and filter notifications
  useEffect(() => {
    let filtered = notifications;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm]);

  // Notification actions
  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAsUnread = async (notificationId) => {
    try {
      // Note: You might need to create an API endpoint for marking as unread
      // For now, we'll handle it locally
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === notificationId
            ? { ...notification, isRead: false }
            : notification
        )
      );
      
      setUnreadCount(prev => prev + 1);
    } catch (error) {
      console.error('Error marking notification as unread:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationsAPI.delete(notificationId);
      
      const deletedNotification = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(notification => notification._id !== notificationId));
      
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      setSelectedNotifications(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(notificationId);
        return newSelected;
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      setUnreadCount(0);
      setSelectedNotifications(new Set());
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteSelected = async () => {
    try {
      const deletePromises = Array.from(selectedNotifications).map(id =>
        notificationsAPI.delete(id)
      );
      
      await Promise.all(deletePromises);
      
      // Update local state
      const deletedCount = selectedNotifications.size;
      const deletedUnreadCount = notifications.filter(
        n => selectedNotifications.has(n._id) && !n.isRead
      ).length;
      
      setNotifications(prev =>
        prev.filter(notification => !selectedNotifications.has(notification._id))
      );
      
      setUnreadCount(prev => Math.max(0, prev - deletedUnreadCount));
      setSelectedNotifications(new Set());
      setBulkAction('');
    } catch (error) {
      console.error('Error deleting selected notifications:', error);
    }
  };

  // Selection handlers
  const toggleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(notificationId)) {
        newSelected.delete(notificationId);
      } else {
        newSelected.add(notificationId);
      }
      return newSelected;
    });
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n._id)));
    }
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (bulkAction === 'mark-read') {
      const markReadPromises = Array.from(selectedNotifications).map(id =>
        notificationsAPI.markAsRead(id)
      );
      await Promise.all(markReadPromises);
      
      setNotifications(prev =>
        prev.map(notification =>
          selectedNotifications.has(notification._id)
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - selectedNotifications.size));
      setSelectedNotifications(new Set());
    } else if (bulkAction === 'delete') {
      await deleteSelected();
    }
    
    setBulkAction('');
  };

  // Notification click handler
  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    // Navigate based on notification data
    if (notification.data?.projectId) {
      navigate(`/projects/${notification.data.projectId}`);
    } else if (notification.data?.beneficiaryId) {
      navigate(`/beneficiaries/${notification.data.beneficiaryId}`);
    } else if (notification.data?.volunteerId) {
      navigate(`/volunteers/${notification.data.volunteerId}`);
    }
  };

  // Get notification icon
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

  // Format timestamp
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
      return notificationDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Load more notifications
  const loadMore = () => {
    if (hasMore && !loading) {
      fetchNotifications(page + 1, true);
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
              >
                <ChevronLeftIcon className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 mt-1">
                  {totalCount} total notifications • {unreadCount} unread
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {selectedNotifications.size > 0 && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {selectedNotifications.size} selected
                  </span>
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Bulk Actions</option>
                    <option value="mark-read">Mark as Read</option>
                    <option value="delete">Delete</option>
                  </select>
                  {bulkAction && (
                    <button
                      onClick={handleBulkAction}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                      Apply
                    </button>
                  )}
                </div>
              )}
              
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  unreadCount === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                Mark All as Read
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FunnelIcon className="w-4 h-4 inline mr-1" />
                Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {statusFilters.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FunnelIcon className="w-4 h-4 inline mr-1" />
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {notificationTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {error ? (
            <div className="p-8 text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load notifications</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => fetchNotifications(1, false)}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <BellIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600">
                {searchTerm || filter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : "You're all caught up! We'll notify you when something important happens."}
              </p>
            </div>
          ) : (
            <>
              {/* Notifications Header */}
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.size === filteredNotifications.length && filteredNotifications.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-600">
                    Select all {filteredNotifications.length} notifications
                  </span>
                </div>
              </div>

              {/* Notifications */}
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-6 hover:bg-gray-50 transition-colors duration-150 ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.has(notification._id)}
                        onChange={() => toggleSelectNotification(notification._id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                      />

                      {/* Icon */}
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div 
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className={`text-lg font-medium ${
                                !notification.isRead ? 'text-gray-900 font-semibold' : 'text-gray-900'
                              }`}>
                                {notification.title}
                              </h3>
                              {!notification.isRead && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  New
                                </span>
                              )}
                              {notification.priority === 'high' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  Important
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-500">
                                {formatTimestamp(notification.createdAt)}
                              </span>
                              <span className="text-sm text-gray-500 capitalize">
                                {notification.type?.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {notification.isRead ? (
                          <button
                            onClick={() => markAsUnread(notification._id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Mark as unread"
                          >
                            <EyeSlashIcon className="h-5 w-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                            title="Mark as read"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete notification"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="w-full text-center text-primary-600 hover:text-primary-700 font-medium py-2 transition-colors"
                  >
                    {loading ? 'Loading...' : 'Load More Notifications'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;