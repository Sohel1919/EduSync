import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ReceiptRefundIcon,
  HeartIcon,
  UsersIcon,
  DocumentTextIcon,
  EyeIcon,
  GiftIcon,
  BuildingLibraryIcon,
  UserCircleIcon,
  StarIcon,
  TrophyIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { donationsAPI } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

// Chart components
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

// StatsCard Component
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

const DonationCard = ({ donation }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
  >
    <div className="flex justify-between items-start mb-3">
      <div>
        <h4 className="font-semibold text-gray-900">{donation.causeName || donation.project?.title || 'General Donation'}</h4>
        <p className="text-sm text-gray-500 mt-1">
          Donated on {new Date(donation.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        donation.status === 'completed' ? 'bg-green-100 text-green-800' :
        donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        donation.status === 'failed' ? 'bg-red-100 text-red-800' :
        'bg-blue-100 text-blue-800'
      }`}>
        {donation.status?.charAt(0).toUpperCase() + donation.status?.slice(1) || 'Pending'}
      </span>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mb-3">
      <div className="flex items-center text-sm text-gray-600">
        <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-400" />
        <span className="font-semibold text-green-600">₹{donation.amount?.toLocaleString('en-IN') || '0'}</span>
      </div>
      <div className="flex items-center text-sm text-gray-600">
        <GiftIcon className="h-4 w-4 mr-2 text-gray-400" />
        <span>{donation.paymentMethod || 'UPI'}</span>
      </div>
    </div>
    
    {donation.project && (
      <div className="mb-2">
        <div className="flex items-center text-sm text-gray-600">
          <BuildingLibraryIcon className="h-4 w-4 mr-2 text-gray-400" />
          <span>{donation.project.organization}</span>
        </div>
      </div>
    )}
    
    {donation.message && (
      <div className="mt-2 p-3 bg-gray-50 rounded">
        <p className="text-sm text-gray-600 italic">"{donation.message}"</p>
      </div>
    )}
    
    {donation.receipt_url && (
      <div className="mt-3 flex justify-end">
        <button className="text-sm text-primary-600 hover:text-primary-800 flex items-center">
          <ReceiptRefundIcon className="h-4 w-4 mr-1" />
          Download Receipt
        </button>
      </div>
    )}
  </motion.div>
);

// Impact Badge Component
const ImpactBadge = ({ score }) => (
  <div className="relative">
    <div className="absolute -top-2 -right-2">
      <div className="relative">
        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">{score}</span>
        </div>
        <StarIcon className="h-4 w-4 text-white absolute -top-1 -right-1" />
      </div>
    </div>
  </div>
);

export default function DonorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [stats, setStats] = useState([]);
  const [donations, setDonations] = useState([]);
  const [donationTrends, setDonationTrends] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [impactData, setImpactData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all dashboard data in parallel
      const [
        dashboardResponse, 
        statsResponse, 
        donationsResponse,
        impactResponse,
        profileResponse
      ] = await Promise.all([
        donationsAPI.getDonorDashboard(),
        donationsAPI.getDonorStats(),
        donationsAPI.getDonorDonations({ limit: 5 }),
        donationsAPI.getDonorImpact(),
        donationsAPI.getDonorProfile()
      ]);

      console.log('API Responses:', {
        dashboard: dashboardResponse.data,
        stats: statsResponse.data,
        donations: donationsResponse.data,
        impact: impactResponse.data,
        profile: profileResponse.data
      });

      // Process dashboard data
      if (dashboardResponse.data?.success) {
        const data = dashboardResponse.data.data;
        setDashboardData(data);
        
        // Set stats from dashboard or stats endpoint
        if (statsResponse.data?.success && statsResponse.data.data?.stats) {
          setStats(statsResponse.data.data.stats.map((stat, index) => ({
            ...stat,
            icon: getIconComponent(stat.icon),
            color: getColorForStat(index),
            bgColor: getBgColorForStat(index)
          })));
        } else if (data.stats) {
          setStats(data.stats.map((stat, index) => ({
            ...stat,
            icon: getIconComponent(stat.icon),
            color: getColorForStat(index),
            bgColor: getBgColorForStat(index)
          })));
        }

        // Set charts data
        if (data.charts?.donationTrends) {
          setDonationTrends(data.charts.donationTrends);
        }
        
        if (data.charts?.paymentMethods) {
          setPaymentMethods(data.charts.paymentMethods);
        }

        // Set recent activity
        if (data.recentActivity) {
          setRecentActivity(data.recentActivity);
        }
      }

      // Set donations
      if (donationsResponse.data?.success) {
        setDonations(donationsResponse.data.data?.donations || []);
      }

      // Set impact data
      if (impactResponse.data?.success) {
        setImpactData(impactResponse.data.data);
      }

      // Set profile data
      if (profileResponse.data?.success) {
        setProfileData(profileResponse.data.data);
      }

    } catch (error) {
      console.error('Error fetching donor dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      setFallbackData();
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for icons and colors
  const getIconComponent = (iconName) => {
    const iconMap = {
      'CurrencyDollarIcon': CurrencyDollarIcon,
      'HeartIcon': HeartIcon,
      'ChartBarIcon': ChartBarIcon,
      'CalendarIcon': CalendarIcon,
      'UserCircleIcon': UserCircleIcon,
      'StarIcon': StarIcon,
      'TrophyIcon': TrophyIcon,
      'UsersIcon': UsersIcon
    };
    return iconMap[iconName] || CurrencyDollarIcon;
  };

  const getColorForStat = (index) => {
    const colors = [
      'from-primary-500 to-primary-600',
      'from-green-500 to-emerald-600',
      'from-purple-500 to-purple-600',
      'from-amber-500 to-amber-600'
    ];
    return colors[index % colors.length];
  };

  const getBgColorForStat = (index) => {
    const bgColors = [
      'bg-primary-50',
      'bg-green-50',
      'bg-purple-50',
      'bg-amber-50'
    ];
    return bgColors[index % bgColors.length];
  };

  const setFallbackData = () => {
    setStats([
      {
        name: 'Total Donations',
        value: '0',
        change: '+0%',
        changeType: 'positive',
        icon: CurrencyDollarIcon,
        color: 'from-primary-500 to-primary-600',
        bgColor: 'bg-primary-50',
        description: 'All time donations'
      },
      {
        name: 'Total Amount',
        value: '₹0',
        change: '+0%',
        changeType: 'positive',
        icon: HeartIcon,
        color: 'from-green-500 to-emerald-600',
        bgColor: 'bg-green-50',
        description: 'Total contributed'
      },
      {
        name: 'Avg. Donation',
        value: '₹0',
        change: '+0%',
        changeType: 'positive',
        icon: ChartBarIcon,
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50',
        description: 'Per donation average'
      },
      {
        name: 'Recurring',
        value: '0',
        change: '+0%',
        changeType: 'positive',
        icon: CalendarIcon,
        color: 'from-amber-500 to-amber-600',
        bgColor: 'bg-amber-50',
        description: 'Active subscriptions'
      }
    ]);
    
    setDonations([]);
    setRecentActivity([]);
    setDonationTrends([
      { name: 'This Month', value: '₹0', percentage: 0 },
      { name: 'Last Month', value: '₹0', percentage: 0 },
      { name: 'This Year', value: '₹0', percentage: 0 },
      { name: 'All Time', value: '₹0', percentage: 0 }
    ]);
    setPaymentMethods([
      { name: 'UPI Payments', value: '0' },
      { name: 'Card Payments', value: '0' },
      { name: 'Net Banking', value: '0' },
      { name: 'Other Methods', value: '0' }
    ]);
    
    setDashboardData({
      user: {
        firstName: user?.firstName || 'Donor'
      },
      quickStats: {
        impactScore: '0%',
        projectsFunded: '0',
        livesImpacted: '0+',
        memberSince: new Date().getFullYear().toString()
      }
    });
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/20 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header skeleton */}
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
          
          {/* Stats grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
          
          {/* Charts skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="text-red-600 mb-4">
              <ExclamationCircleIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/20 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Donor Dashboard</h1>
              {dashboardData?.user?.impactScore && (
                <ImpactBadge score={dashboardData.user.impactScore} />
              )}
            </div>
            <p className="mt-2 text-gray-600">
              Welcome back! Track your donations and impact.
              {dashboardData?.user?.firstName && `, ${dashboardData.user.firstName}`}
              {!dashboardData?.user?.firstName && user?.firstName && `, ${user.firstName}`}
            </p>
            {profileData && (
              <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                <UserCircleIcon className="h-4 w-4" />
                <span>Member since {profileData.personalInfo?.memberSince || '2023'}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshData}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <ArrowRightIcon className="h-4 w-4 rotate-90" />
              Refresh
            </motion.button>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center space-x-2 text-primary-600 bg-primary-50 px-4 py-2 rounded-lg border border-primary-200"
            >
              <DocumentTextIcon className="h-5 w-5" />
              <span className="font-semibold">Last updated: Today</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatsCard key={stat.name} stat={stat} index={index} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white shadow-lg rounded-xl border border-gray-200"
          >
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100/50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-primary-600" />
                  Recent Activity
                </h3>
                <span className="text-sm text-gray-500">{recentActivity.length} activities</span>
              </div>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="px-6 py-4 hover:bg-primary-50/30 transition-colors duration-150 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                          activity.type === 'donation' ? 'bg-green-100' :
                          activity.type === 'subscription' ? 'bg-blue-100' :
                          'bg-amber-100'
                        } group-hover:scale-105 transition-transform duration-200`}>
                          {activity.type === 'donation' && <CurrencyDollarIcon className="h-5 w-5 text-green-600" />}
                          {activity.type === 'subscription' && <CalendarIcon className="h-5 w-5 text-blue-600" />}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-primary-700 transition-colors duration-200">
                            {activity.user} <span className="text-gray-500 font-normal">{activity.action}</span>
                            {activity.amount && <span className="text-green-600 font-medium"> {activity.amount}</span>}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.project} • {activity.time}
                          </p>
                          {activity.status && (
                            <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                              activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {activity.status}
                            </span>
                          )}
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
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p>No recent activities</p>
                  <p className="text-sm text-gray-400 mt-1">Make your first donation to see activities here</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column - Charts */}
          <div className="space-y-6">
            {/* Payment Methods Distribution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <PieChartCard 
                data={paymentMethods.length > 0 ? paymentMethods : [
                  { name: 'UPI Payments', value: '0' },
                  { name: 'Card Payments', value: '0' },
                  { name: 'Net Banking', value: '0' },
                  { name: 'Other Methods', value: '0' }
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <TrophyIcon className="h-5 w-5 mr-2 text-primary-100" />
                  Donor Profile
                </h3>
                {dashboardData?.user?.impactScore && (
                  <div className="text-2xl font-bold text-primary-100">{dashboardData.user.impactScore}</div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {dashboardData?.quickStats ? (
                  <>
                    <div className="text-center p-3 bg-primary-500/20 rounded-lg backdrop-blur-sm">
                      <div className="text-2xl font-bold">{dashboardData.quickStats.impactScore || '0%'}</div>
                      <div className="text-primary-100 text-sm">Impact Score</div>
                    </div>
                    <div className="text-center p-3 bg-primary-500/20 rounded-lg backdrop-blur-sm">
                      <div className="text-2xl font-bold">{dashboardData.quickStats.projectsFunded || '0'}</div>
                      <div className="text-primary-100 text-sm">Projects Funded</div>
                    </div>
                    <div className="text-center p-3 bg-primary-500/20 rounded-lg backdrop-blur-sm">
                      <div className="text-2xl font-bold">{dashboardData.quickStats.livesImpacted || '0+'}</div>
                      <div className="text-primary-100 text-sm">Lives Impacted</div>
                    </div>
                    <div className="text-center p-3 bg-primary-500/20 rounded-lg backdrop-blur-sm">
                      <div className="text-2xl font-bold">{dashboardData.quickStats.memberSince || '2023'}</div>
                      <div className="text-primary-100 text-sm">Member Since</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center p-3 bg-primary-500/20 rounded-lg backdrop-blur-sm">
                      <div className="text-2xl font-bold">0%</div>
                      <div className="text-primary-100 text-sm">Impact Score</div>
                    </div>
                    <div className="text-center p-3 bg-primary-500/20 rounded-lg backdrop-blur-sm">
                      <div className="text-2xl font-bold">0</div>
                      <div className="text-primary-100 text-sm">Projects Funded</div>
                    </div>
                    <div className="text-center p-3 bg-primary-500/20 rounded-lg backdrop-blur-sm">
                      <div className="text-2xl font-bold">0+</div>
                      <div className="text-primary-100 text-sm">Lives Impacted</div>
                    </div>
                    <div className="text-center p-3 bg-primary-500/20 rounded-lg backdrop-blur-sm">
                      <div className="text-2xl font-bold">2023</div>
                      <div className="text-primary-100 text-sm">Member Since</div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Donation Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <ProgressChart 
            data={donationTrends}
            title="Donation Trends"
          />
        </motion.div>

        {/* Recent Donations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="bg-white shadow-lg rounded-xl border border-gray-200"
        >
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100/50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2 text-green-600" />
                Recent Donations
              </h3>
              <button 
                onClick={() => window.location.href = '/donations/history'}
                className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
              >
                View All
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {donations.length > 0 ? (
              donations.map((donation) => (
                <DonationCard key={donation._id} donation={donation} />
              ))
            ) : (
              <div className="text-center py-8">
                <CurrencyDollarIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No donations yet</p>
                <p className="text-sm text-gray-400 mt-1">Make your first donation to see it here</p>
                <button
                  onClick={() => window.location.href = '/donate'}
                  className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Make a Donation
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Impact Summary */}
        {impactData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="bg-gradient-to-r from-emerald-600 to-teal-700 shadow-lg rounded-xl p-6 text-white"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <HeartIcon className="h-5 w-5 mr-2 text-emerald-100" />
                  Your Impact Summary
                </h3>
                <p className="text-emerald-100 text-sm">
                  See how your contributions are making a difference
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{impactData.summary?.livesImpacted || '0+'}</div>
                <div className="text-emerald-100 text-sm">Lives Impacted</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-emerald-500/20 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold">{impactData.summary?.totalDonations || 0}</div>
                <div className="text-emerald-100 text-sm">Total Donations</div>
              </div>
              <div className="text-center p-4 bg-emerald-500/20 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold">{impactData.summary?.projectsSupported || 0}</div>
                <div className="text-emerald-100 text-sm">Projects Supported</div>
              </div>
              <div className="text-center p-4 bg-emerald-500/20 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold">{impactData.summary?.causesSupported || 0}</div>
                <div className="text-emerald-100 text-sm">Causes Supported</div>
              </div>
              <div className="text-center p-4 bg-emerald-500/20 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold">₹{impactData.summary?.avgDonationPerProject?.toLocaleString('en-IN') || '0'}</div>
                <div className="text-emerald-100 text-sm">Avg/Project</div>
              </div>
            </div>
            
            {impactData.topProjects && impactData.topProjects.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Top Projects You've Supported</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {impactData.topProjects.map((project, index) => (
                    <div key={index} className="p-4 bg-emerald-500/10 rounded-lg">
                      <h5 className="font-medium mb-1">{project.title}</h5>
                      <div className="text-sm text-emerald-200 mb-2">{project.category}</div>
                      <div className="flex justify-between text-sm">
                        <span>Donated: ₹{project.totalDonated?.toLocaleString('en-IN')}</span>
                        <span className="text-emerald-300">{project.impact}% impact</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          className="bg-gradient-to-r from-primary-600 to-secondary-700 shadow-lg rounded-xl p-6 text-white"
        >
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => window.location.href = '/donate'}
              className="p-4 bg-primary-500/20 rounded-lg backdrop-blur-sm hover:bg-primary-500/30 transition-colors duration-200 group"
            >
              <div className="text-center">
                <CurrencyDollarIcon className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm">Donate Now</span>
              </div>
            </button>
            <button 
              onClick={() => window.location.href = '/donations/subscriptions'}
              className="p-4 bg-primary-500/20 rounded-lg backdrop-blur-sm hover:bg-primary-500/30 transition-colors duration-200 group"
            >
              <div className="text-center">
                <CalendarIcon className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm">Set Recurring</span>
              </div>
            </button>
            <button 
              onClick={() => window.location.href = '/donations/receipts'}
              className="p-4 bg-primary-500/20 rounded-lg backdrop-blur-sm hover:bg-primary-500/30 transition-colors duration-200 group"
            >
              <div className="text-center">
                <ReceiptRefundIcon className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm">Tax Receipts</span>
              </div>
            </button>
            <button 
              onClick={() => window.location.href = '/impact-report'}
              className="p-4 bg-primary-500/20 rounded-lg backdrop-blur-sm hover:bg-primary-500/30 transition-colors duration-200 group"
            >
              <div className="text-center">
                <ChartBarIcon className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm">Impact Report</span>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Profile Info */}
        {profileData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.6 }}
            className="bg-white shadow-lg rounded-xl border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserCircleIcon className="h-5 w-5 mr-2 text-primary-600" />
              Donor Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Donation Frequency</h4>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {profileData.donationPreferences?.frequency || 'One-time'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Favorite Cause</h4>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {profileData.donationStats?.favoriteCause || 'Education'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Total Contributions</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {profileData.donationStats?.totalAmount ? `₹${profileData.donationStats.totalAmount.toLocaleString('en-IN')}` : '₹0'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Donation Count</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {profileData.donationStats?.totalDonations || 0}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Add missing icon component
const ExclamationCircleIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);