import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UsersIcon,
  CurrencyDollarIcon,
  HeartIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  CalendarIcon,
  MapPinIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { projectsAPI, donationsAPI, volunteersAPI, beneficiariesAPI } from '../../services/apiService';

// Chart components for data visualization
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

export default function AdminDashboard() {
  const [stats, setStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [projectProgress, setProjectProgress] = useState([]);
  const [donationStats, setDonationStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        projectsResponse,
        donationsResponse,
        volunteersResponse,
        beneficiariesResponse,
        donationStatsResponse
      ] = await Promise.all([
        projectsAPI.getAll(),
        donationsAPI.getAllDonations({ limit: 5 }),
        volunteersAPI.getAll(),
        beneficiariesAPI.getAllApplications({ limit: 5 }),
        donationsAPI.getStatistics()
      ]);

      // Process stats data
      const processedStats = [
        {
          name: 'Total Donors',
          value: donationStatsResponse.data?.statistics?.total || '0',
          change: '+12%',
          changeType: 'positive',
          icon: UsersIcon,
          color: 'from-primary-500 to-primary-600',
          bgColor: 'bg-primary-50',
          description: 'Active donors this month'
        },
        {
          name: 'Total Beneficiaries',
          value: beneficiariesResponse.data?.pagination?.total || '0',
          change: '+8%',
          changeType: 'positive',
          icon: HeartIcon,
          color: 'from-green-500 to-emerald-600',
          bgColor: 'bg-green-50',
          description: 'Lives impacted'
        },
        {
          name: 'Active Volunteers',
          value: volunteersResponse.data?.length || '0',
          change: '+15%',
          changeType: 'positive',
          icon: UserGroupIcon,
          color: 'from-purple-500 to-purple-600',
          bgColor: 'bg-purple-50',
          description: 'Currently active'
        },
        {
          name: 'Total Donations',
          value: `₹${(donationStatsResponse.data?.statistics?.totalAmount || 0).toLocaleString()}`,
          change: '+23%',
          changeType: 'positive',
          icon: CurrencyDollarIcon,
          color: 'from-amber-500 to-amber-600',
          bgColor: 'bg-amber-50',
          description: 'Raised this year'
        }
      ];

      // Process recent activities
      const activities = [];
      
      // Add recent donations
      if (donationsResponse.data?.data) {
        donationsResponse.data.data.slice(0, 3).forEach(donation => {
          activities.push({
            id: donation._id,
            user: donation.donor_info?.name || 'Anonymous',
            action: 'donated',
            amount: `₹${donation.amount}`,
            time: new Date(donation.createdAt).toLocaleDateString(),
            type: 'donation',
            project: donation.causeName || 'General Donation'
          });
        });
      }

      // Add recent beneficiary applications
      if (beneficiariesResponse.data?.data) {
        beneficiariesResponse.data.data.slice(0, 2).forEach(app => {
          activities.push({
            id: app._id,
            user: `${app.personalInfo?.firstName} ${app.personalInfo?.lastName}`,
            action: 'applied for beneficiary',
            time: new Date(app.createdAt).toLocaleDateString(),
            type: 'beneficiary',
            project: app.projectTitle
          });
        });
      }

      // Process project progress
      const progressData = [];
      if (projectsResponse.data?.data) {
        projectsResponse.data.data.slice(0, 4).forEach(project => {
          const progress = project.targetAmount > 0 
            ? Math.round((project.collectedAmount / project.targetAmount) * 100)
            : 0;
          
          progressData.push({
            name: project.title,
            progress: progress,
            target: `₹${project.targetAmount?.toLocaleString() || '0'}`,
            raised: `₹${project.collectedAmount?.toLocaleString() || '0'}`,
            percentage: progress
          });
        });
      }

      // Process donation statistics for charts
      const donationChartData = [];
      if (donationStatsResponse.data?.statistics?.paymentMethods) {
        donationStatsResponse.data.statistics.paymentMethods.forEach(method => {
          donationChartData.push({
            name: method._id || 'Unknown',
            value: method.count || 0,
            percentage: Math.round((method.count / donationStatsResponse.data.statistics.total) * 100) || 0
          });
        });
      }

      setStats(processedStats);
      setRecentActivities(activities);
      setProjectProgress(progressData);
      setDonationStats(donationChartData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set fallback data
      setStats([
        {
          name: 'Total Donors',
          value: '0',
          change: '+0%',
          changeType: 'positive',
          icon: UsersIcon,
          color: 'from-primary-500 to-primary-600',
          bgColor: 'bg-primary-50',
          description: 'Active donors this month'
        },
        {
          name: 'Total Beneficiaries',
          value: '0',
          change: '+0%',
          changeType: 'positive',
          icon: HeartIcon,
          color: 'from-green-500 to-emerald-600',
          bgColor: 'bg-green-50',
          description: 'Lives impacted'
        },
        {
          name: 'Active Volunteers',
          value: '0',
          change: '+0%',
          changeType: 'positive',
          icon: UserGroupIcon,
          color: 'from-purple-500 to-purple-600',
          bgColor: 'bg-purple-50',
          description: 'Currently active'
        },
        {
          name: 'Total Donations',
          value: '₹0',
          change: '+0%',
          changeType: 'positive',
          icon: CurrencyDollarIcon,
          color: 'from-amber-500 to-amber-600',
          bgColor: 'bg-amber-50',
          description: 'Raised this year'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickStats = [
    { name: 'Active Projects', value: projectProgress.length.toString() },
    { name: 'Success Rate', value: '89%' },
    { name: 'Communities', value: '24' },
    { name: 'Countries', value: '5' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/20 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Loading skeleton */}
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="mt-2 text-gray-600">Welcome back! Here's what's happening with EduSync today.</p>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatsCard key={stat.name} stat={stat} index={index} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
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
              {recentActivities.length > 0 ? recentActivities.map((activity) => (
                <div key={activity.id} className="px-6 py-4 hover:bg-primary-50/30 transition-colors duration-150 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                        activity.type === 'donation' ? 'bg-green-100' :
                        activity.type === 'volunteer' ? 'bg-blue-100' :
                        activity.type === 'beneficiary' ? 'bg-purple-100' : 'bg-amber-100'
                      } group-hover:scale-105 transition-transform duration-200`}>
                        {activity.type === 'donation' && <CurrencyDollarIcon className="h-5 w-5 text-green-600" />}
                        {activity.type === 'volunteer' && <UserGroupIcon className="h-5 w-5 text-blue-600" />}
                        {activity.type === 'beneficiary' && <HeartIcon className="h-5 w-5 text-purple-600" />}
                        {activity.type === 'project' && <ChartBarIcon className="h-5 w-5 text-amber-600" />}
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

          {/* Charts Section */}
          <div className="space-y-6">
            {/* Payment Methods Distribution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <PieChartCard 
                data={donationStats.length > 0 ? donationStats : [
                  { name: 'UPI Payments', value: '0', percentage: 0 },
                  { name: 'Card Payments', value: '0', percentage: 0 },
                  { name: 'Net Banking', value: '0', percentage: 0 },
                  { name: 'Other Methods', value: '0', percentage: 0 }
                ]}
                title="Payment Methods"
              />
            </motion.div>

            {/* Quick Stats */}
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

        {/* Project Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <ProgressChart 
            data={projectProgress.length > 0 ? projectProgress : [
              { name: 'No Projects', progress: 0, target: '₹0', raised: '₹0', percentage: 0 }
            ]}
            title="Project Progress"
          />
        </motion.div>
      </div>
    </div>
  );
}