import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserCircleIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationCircleIcon,
  EyeIcon,
  UsersIcon,
  HeartIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { beneficiariesAPI, projectsAPI } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

// Chart components - Updated to match AdminDashboard
const ProgressChart = ({ data, title }) => (
  <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      <ChartBarIcon className="h-5 w-5 mr-2 text-primary-600" />
      {title}
    </h3>
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index}>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span className="font-medium">{item.name}</span>
            <span>{item.value}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${item.percentage}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PieChartCard = ({ data, title }) => (
  <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      <ChartBarIcon className="h-5 w-5 mr-2 text-primary-600" />
      {title}
    </h3>
    <div className="grid grid-cols-2 gap-4">
      {data.map((item, index) => (
        <div key={index} className="text-center p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg">
          <div className="text-2xl font-bold text-primary-600">{item.value}</div>
          <div className="text-sm text-gray-600 mt-1">{item.name}</div>
        </div>
      ))}
    </div>
  </div>
);

// Updated StatsCard to match AdminDashboard
const StatsCard = ({ stat, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300"
  >
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{stat.name}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          <div className={`flex items-center mt-1 text-sm font-semibold ${
            stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
          }`}>
            {stat.changeType === 'positive' ? (
              <ArrowTrendingUpIcon className="h-4 w-4" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4" />
            )}
            <span className="ml-1">{stat.change}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
        </div>
        <div className={`p-3 rounded-xl ${stat.bgColor}`}>
          <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} text-white`}>
            <stat.icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const ApplicationCard = ({ application }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
  >
    <div className="flex justify-between items-start mb-3">
      <div>
        <h4 className="font-semibold text-gray-900">{application.projectTitle}</h4>
        <p className="text-sm text-gray-500 mt-1">
          Applied on {new Date(application.createdAt).toLocaleDateString()}
        </p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        application.status === 'approved' ? 'bg-green-100 text-green-800' :
        application.status === 'rejected' ? 'bg-red-100 text-red-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
      </span>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mb-3">
      <div className="flex items-center text-sm text-gray-600">
        <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-400" />
        <span>Amount: ₹{application.requestedAmount?.toLocaleString() || '0'}</span>
      </div>
      <div className="flex items-center text-sm text-gray-600">
        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
        <span>Duration: {application.projectDuration || 'N/A'}</span>
      </div>
    </div>
    
    {application.reviewNotes && (
      <div className="mt-2 p-3 bg-gray-50 rounded">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Review Note:</span> {application.reviewNotes}
        </p>
      </div>
    )}
  </motion.div>
);

export default function BeneficiaryDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [applications, setApplications] = useState([]);
  const [projectProgress, setProjectProgress] = useState([]);
  const [applicationStatus, setApplicationStatus] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // In your fetchDashboardData function, update to use new endpoint:
const fetchDashboardData = async () => {
  try {
    setLoading(true);
    
    // Use the new dashboard endpoint
    const dashboardResponse = await beneficiariesAPI.getDashboard();
    
    if (dashboardResponse.data?.success) {
      const dashboardData = dashboardResponse.data.data;
      
      // Map the stats to include icons and colors
      const mappedStats = dashboardData.stats.map((stat, index) => {
        const icons = [DocumentTextIcon, CheckCircleIcon, ClockIcon, XCircleIcon];
        const colors = [
          'from-blue-500 to-blue-600',
          'from-green-500 to-emerald-600',
          'from-amber-500 to-amber-600',
          'from-red-500 to-red-600'
        ];
        const bgColors = ['bg-blue-50', 'bg-green-50', 'bg-amber-50', 'bg-red-50'];
        
        return {
          ...stat,
          icon: icons[index] || DocumentTextIcon,
          color: colors[index] || 'from-blue-500 to-blue-600',
          bgColor: bgColors[index] || 'bg-blue-50'
        };
      });
      
      setStats(mappedStats);
      setApplications(dashboardData.applications || []);
      setProjectProgress(dashboardData.projectProgress || []);
      setApplicationStatus(dashboardData.applicationStatus || []);
      setRecentActivity(dashboardData.recentActivity || []);
    }
    
  } catch (error) {
    console.error('Error fetching beneficiary dashboard data:', error);
    // Set fallback data...
  } finally {
    setLoading(false);
  }
};

  const quickStats = [
    { name: 'Success Rate', value: stats[1]?.value > 0 ? `${Math.round((parseInt(stats[1].value) / parseInt(stats[0].value)) * 100) || 0}%` : '0%' },
    { name: 'Avg. Funding', value: '₹25,000' },
    { name: 'Response Time', value: '3-5 days' },
    { name: 'Revision Rate', value: '12%' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/20 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Loading skeleton - Matches AdminDashboard */}
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header - Matches AdminDashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Beneficiary Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome back! Track your project applications and funding status.
              {user?.firstName && `, ${user.firstName}`}
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center space-x-2 text-primary-600 bg-primary-50 px-4 py-2 rounded-lg border border-primary-200"
          >
            <DocumentTextIcon className="h-5 w-5" />
            <span className="font-semibold">Last updated: Today</span>
          </motion.div>
        </motion.div>

        {/* Stats Grid - Same as AdminDashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatsCard key={stat.name} stat={stat} index={index} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity - Matches AdminDashboard */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white shadow-lg rounded-xl border border-gray-200"
          >
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100/50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-primary-600" />
                Recent Activity
              </h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {recentActivity.length > 0 ? recentActivity.map((activity) => (
                <div key={activity.id} className="px-6 py-4 hover:bg-primary-50/30 transition-colors duration-150 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                        activity.type === 'approved' ? 'bg-green-100' :
                        activity.type === 'rejected' ? 'bg-red-100' :
                        'bg-yellow-100'
                      } group-hover:scale-105 transition-transform duration-200`}>
                        {activity.type === 'approved' && <CheckCircleIcon className="h-5 w-5 text-green-600" />}
                        {activity.type === 'rejected' && <XCircleIcon className="h-5 w-5 text-red-600" />}
                        {activity.type === 'pending' && <ClockIcon className="h-5 w-5 text-yellow-600" />}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-primary-700 transition-colors duration-200">
                          {activity.user} <span className="text-gray-500 font-normal">{activity.action}</span>
                          {activity.amount && <span className="text-green-600 font-medium"> {activity.amount}</span>}
                        </p>
                        <p className="text-sm text-gray-500">{activity.project} • {activity.time}</p>
                      </div>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-gray-400 hover:text-primary-600 transition-colors duration-200"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              )) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p>No recent activities</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Charts Section - Matches AdminDashboard */}
          <div className="space-y-6">
            {/* Application Status Distribution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <PieChartCard 
                data={applicationStatus.length > 0 ? applicationStatus : [
                  { name: 'Approved', value: '0' },
                  { name: 'Pending', value: '0' },
                  { name: 'Rejected', value: '0' },
                  { name: 'Draft', value: '0' }
                ]}
                title="Application Status"
              />
            </motion.div>

            {/* Quick Stats - Matches AdminDashboard style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-gradient-to-r from-primary-600 to-secondary-700 shadow-lg rounded-xl p-6 text-white"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2 text-primary-100" />
                Quick Overview
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {quickStats.map((stat, index) => (
                  <div key={stat.name} className="text-center p-3 bg-primary-500/20 rounded-lg backdrop-blur-sm">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-primary-100 text-sm">{stat.name}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Project Progress - Matches AdminDashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <ProgressChart 
            data={projectProgress.length > 0 ? projectProgress : [
              { name: 'No Projects', progress: 0, target: '₹0', raised: '₹0', percentage: 0 }
            ]}
            title="Project Funding Progress"
          />
        </motion.div>

        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="bg-white shadow-lg rounded-xl border border-gray-200"
        >
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100/50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2 text-green-600" />
              Recent Applications
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {applications.length > 0 ? (
              applications.map((application) => (
                <ApplicationCard key={application._id} application={application} />
              ))
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No applications found</p>
                <p className="text-sm text-gray-400 mt-1">Submit your first project application</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}