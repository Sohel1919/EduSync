import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import {
  DocumentPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  EyeIcon,
  MapPinIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

// Mock data for volunteer projects
const mockVolunteerProjects = [
  {
    id: '1',
    title: 'Community Cleanup Drive',
    description: 'Organizing a neighborhood cleanup event to improve local environment',
    status: 'approved',
    createdDate: '2024-01-15',
    updatedDate: '2024-01-18',
    category: 'Environment',
    location: 'Central Park',
    volunteersNeeded: 20
  },
  {
    id: '2',
    title: 'Food Distribution Program',
    description: 'Weekly food distribution for underserved communities',
    status: 'pending',
    createdDate: '2024-01-20',
    category: 'Hunger Relief',
    location: 'Community Center',
    volunteersNeeded: 15
  },
  {
    id: '3',
    title: 'Youth Mentorship Program',
    description: 'Mentoring underprivileged youth in educational activities',
    status: 'rejected',
    createdDate: '2024-01-10',
    updatedDate: '2024-01-12',
    category: 'Education',
    location: 'Local School',
    volunteersNeeded: 10,
    feedback: 'Program scope needs more detailed planning and budget breakdown'
  },
  {
    id: '4',
    title: 'Elderly Care Initiative',
    description: 'Weekly visits and assistance for elderly residents',
    status: 'approved',
    createdDate: '2024-01-05',
    updatedDate: '2024-01-08',
    category: 'Elderly Care',
    location: 'Senior Homes',
    volunteersNeeded: 25
  },
  {
    id: '5',
    title: 'Digital Literacy Workshop',
    description: 'Teaching basic computer skills to seniors',
    status: 'pending',
    createdDate: '2024-01-25',
    category: 'Education',
    location: 'Library',
    volunteersNeeded: 8
  }
];

const VolunteerDashboardPage = () => {
  const [projects, setProjects] = useState(mockVolunteerProjects);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    approvedProjects: 0,
    rejectedProjects: 0,
    pendingProjects: 0,
    attendanceRate: 85,
    totalVolunteerHours: 156
  });

  // Calculate stats from projects
  useEffect(() => {
    const totalProjects = projects.length;
    const approvedProjects = projects.filter(p => p.status === 'approved').length;
    const rejectedProjects = projects.filter(p => p.status === 'rejected').length;
    const pendingProjects = projects.filter(p => p.status === 'pending').length;

    setStats(prev => ({
      ...prev,
      totalProjects,
      approvedProjects,
      rejectedProjects,
      pendingProjects
    }));
  }, [projects]);

  // Socket.io connection for real-time notifications
  useEffect(() => {
    // In a real app, you would get the volunteer ID from authentication context or localStorage
    const volunteerId = localStorage.getItem('volunteerId') || 'volunteer_123';
    
    const newSocket = io(import.meta.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      query: { volunteerId },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('project_approved', (data) => {
      console.log('Project approved:', data);
      handleProjectUpdate(data.projectId, 'approved', data.message);
      addNotification({
        type: 'project_approved',
        title: 'Project Approved! 🎉',
        message: data.message,
        projectId: data.projectId
      });
    });

    newSocket.on('project_rejected', (data) => {
      console.log('Project rejected:', data);
      handleProjectUpdate(data.projectId, 'rejected', data.message, data.feedback);
      addNotification({
        type: 'project_rejected',
        title: 'Project Update',
        message: data.message,
        projectId: data.projectId
      });
    });

    // Simulate incoming notifications for demo
    const demoNotificationInterval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance every 10 seconds
        const pendingProjects = projects.filter(p => p.status === 'pending');
        if (pendingProjects.length > 0) {
          const randomProject = pendingProjects[Math.floor(Math.random() * pendingProjects.length)];
          const isApproved = Math.random() > 0.5;
          
          if (isApproved) {
            newSocket.emit('project_approved', {
              projectId: randomProject.id,
              volunteerId: volunteerId,
              message: `Your project "${randomProject.title}" has been approved!`
            });
          } else {
            newSocket.emit('project_rejected', {
              projectId: randomProject.id,
              volunteerId: volunteerId,
              message: `Your project "${randomProject.title}" needs revisions`,
              feedback: 'Please provide more details about the implementation plan and budget allocation.'
            });
          }
        }
      }
    }, 10000);

    setSocket(newSocket);

    return () => {
      clearInterval(demoNotificationInterval);
      newSocket.close();
    };
  }, [projects]);

  const handleProjectUpdate = (projectId, status, message, feedback) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { 
            ...project, 
            status, 
            updatedDate: new Date().toISOString().split('T')[0],
            feedback: feedback || project.feedback
          }
        : project
    ));
  };

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep last 10 notifications
    
    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.projectId
      });
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          addNotification({
            type: 'project_approved',
            title: 'Notifications Enabled',
            message: 'You will now receive real-time updates about your projects.',
            projectId: 'system'
          });
        }
      });
    }
  };

  // Stats cards data - Updated colors to match navbar theme
  const statsCards = [
    {
      name: 'Total Projects',
      value: stats.totalProjects.toString(),
      icon: DocumentPlusIcon,
      color: 'from-primary-500 to-primary-600',
      description: 'Projects you created'
    },
    {
      name: 'Approved Projects',
      value: stats.approvedProjects.toString(),
      icon: CheckCircleIcon,
      color: 'from-green-500 to-green-600',
      description: 'Successfully approved'
    },
    {
      name: 'Rejected Projects',
      value: stats.rejectedProjects.toString(),
      icon: XCircleIcon,
      color: 'from-red-500 to-red-600',
      description: 'Need revisions'
    },
    {
      name: 'Attendance Rate',
      value: `${stats.attendanceRate}%`,
      icon: ChartBarIcon,
      color: 'from-secondary-500 to-secondary-600',
      description: 'Your participation rate'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-amber-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Volunteer Dashboard
            </h1>
            <p className="mt-2 text-gray-600">Manage your projects and track your impact</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              isConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <button
              onClick={requestNotificationPermission}
              className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-2 rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
            >
              Enable Notifications
            </button>
          </div>
        </div>
      </motion.div>

      {/* Notifications Panel - Updated colors */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white shadow-lg rounded-lg border-l-4 border-primary-500"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadNotificationsCount > 0 && (
                  <span className="bg-primary-500 text-white text-sm px-2 py-1 rounded-full">
                    {unreadNotificationsCount} new
                  </span>
                )}
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    notification.read 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-primary-50 border-primary-200 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium ${
                          notification.read ? 'text-gray-900' : 'text-primary-900'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markNotificationAsRead(notification.id)}
                        className="ml-2 text-primary-600 hover:text-primary-800 transition-colors"
                        title="Mark as read"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid - Updated colors */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-primary-200"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} shadow-md`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{stat.value}</dd>
                    <dt className="text-xs text-gray-400 mt-1">{stat.description}</dt>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Projects */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white shadow rounded-lg border border-gray-200"
        >
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">My Projects</h3>
              <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm font-medium">
                {projects.length} total
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {projects.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <DocumentPlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No projects created yet</p>
                <button className="mt-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-2 rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 shadow-md hover:shadow-lg">
                  Create Your First Project
                </button>
              </div>
            ) : (
              projects.map((project) => (
                <div 
                  key={project.id} 
                  className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer group"
                  onClick={() => {
                    // Navigate to project details or show modal
                    console.log('View project:', project.id);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      {getStatusIcon(project.status)}
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary-700 transition-colors">
                          {project.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{project.location}</span>
                          <span className="mx-2">•</span>
                          <UserGroupIcon className="h-4 w-4 mr-1" />
                          <span>{project.volunteersNeeded} volunteers</span>
                          <span className="mx-2">•</span>
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <span>{new Date(project.createdDate).toLocaleDateString()}</span>
                        </div>
                        {project.feedback && (
                          <p className="text-sm text-amber-600 mt-2 flex items-start">
                            <ExclamationTriangleIcon className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                            <span>{project.feedback}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Activity & Quick Stats */}
        <div className="space-y-6">
          {/* Project Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white shadow rounded-lg border border-gray-200"
          >
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Project Activity</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
              {projects
                .filter(project => project.updatedDate)
                .sort((a, b) => new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime())
                .slice(0, 6)
                .map((project) => (
                  <div key={project.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{project.title}</span> was{' '}
                          <span className={
                            project.status === 'approved' 
                              ? 'text-green-600 font-medium' 
                              : project.status === 'rejected' 
                              ? 'text-red-600 font-medium' 
                              : 'text-amber-600 font-medium'
                          }>
                            {project.status}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {project.updatedDate && `Updated on ${new Date(project.updatedDate).toLocaleDateString()}`}
                        </p>
                        {project.feedback && project.status === 'rejected' && (
                          <p className="text-xs text-amber-600 mt-1 line-clamp-1">
                            Feedback: {project.feedback}
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        {getStatusIcon(project.status)}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>

          {/* Quick Stats - Updated gradient */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 shadow rounded-lg p-6 text-white"
          >
            <h3 className="text-lg font-medium mb-4">Volunteer Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalVolunteerHours}</div>
                <div className="text-primary-100 text-sm">Total Hours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.pendingProjects}</div>
                <div className="text-primary-100 text-sm">Pending Review</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {stats.totalProjects > 0 ? Math.round((stats.approvedProjects / stats.totalProjects) * 100) : 0}%
                </div>
                <div className="text-primary-100 text-sm">Approval Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {projects.reduce((acc, project) => acc + project.volunteersNeeded, 0)}
                </div>
                <div className="text-primary-100 text-sm">Volunteers Needed</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Project Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="bg-white shadow rounded-lg p-6 border border-gray-200"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Project Status Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-green-900">{stats.approvedProjects}</div>
                <div className="text-green-700">Approved Projects</div>
                <div className="text-green-600 text-sm mt-1">Ready to launch</div>
              </div>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-amber-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-amber-900">{stats.pendingProjects}</div>
                <div className="text-amber-700">Under Review</div>
                <div className="text-amber-600 text-sm mt-1">Awaiting approval</div>
              </div>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <XCircleIcon className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-red-900">{stats.rejectedProjects}</div>
                <div className="text-red-700">Needs Revision</div>
                <div className="text-red-600 text-sm mt-1">Update required</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VolunteerDashboardPage;