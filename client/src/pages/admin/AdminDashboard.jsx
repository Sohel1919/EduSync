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

const stats = [
  {
    name: 'Total Donors',
    value: '1,248',
    change: '+12%',
    changeType: 'positive',
    icon: UsersIcon,
    color: 'from-primary-500 to-primary-600',
    bgColor: 'bg-primary-50',
    description: 'Active donors this month'
  },
  {
    name: 'Total Beneficiaries',
    value: '10,543',
    change: '+8%',
    changeType: 'positive',
    icon: HeartIcon,
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50',
    description: 'Lives impacted'
  },
  {
    name: 'Active Volunteers',
    value: '324',
    change: '+15%',
    changeType: 'positive',
    icon: UserGroupIcon,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Currently active'
  },
  {
    name: 'Total Donations',
    value: '₹248,230',
    change: '+23%',
    changeType: 'positive',
    icon: CurrencyDollarIcon,
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50',
    description: 'Raised this year'
  }
];

const recentActivities = [
  { 
    id: 1, 
    user: 'Sarah Johnson', 
    action: 'donated', 
    amount: '₹2,500', 
    time: '2 min ago',
    type: 'donation',
    project: 'Education for All'
  },
  { 
    id: 2, 
    user: 'Mike Chen', 
    action: 'joined as volunteer', 
    time: '5 min ago',
    type: 'volunteer',
    project: 'Community Outreach'
  },
  { 
    id: 3, 
    user: 'Emma Davis', 
    action: 'approved beneficiary application', 
    time: '10 min ago',
    type: 'beneficiary',
    project: 'Healthcare Access'
  },
  { 
    id: 4, 
    user: 'Alex Rodriguez', 
    action: 'created new project', 
    time: '15 min ago',
    type: 'project',
    project: 'Women Empowerment'
  },
];

const upcomingEvents = [
  {
    id: 1,
    title: 'Community Health Camp',
    date: 'Dec 15, 2024',
    location: 'Rural Village Center',
    volunteers: 12,
    status: 'confirmed'
  },
  {
    id: 2,
    title: 'School Supplies Distribution',
    date: 'Dec 20, 2024',
    location: 'Local Primary School',
    volunteers: 8,
    status: 'confirmed'
  },
  {
    id: 3,
    title: 'Fundraising Gala',
    date: 'Jan 5, 2025',
    location: 'City Convention Center',
    volunteers: 20,
    status: 'planning'
  }
];

const ProjectProgress = () => (
  <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      <ChartBarIcon className="h-5 w-5 mr-2 text-primary-600" />
      Project Progress
    </h3>
    <div className="space-y-4">
      {[
        { name: 'Education for All', progress: 75, target: '₹5,00,000', raised: '₹3,75,000' },
        { name: 'Healthcare Access', progress: 60, target: '₹7,50,000', raised: '₹4,50,000' },
        { name: 'Women Empowerment', progress: 45, target: '₹3,00,000', raised: '₹1,35,000' },
        { name: 'Clean Water Initiative', progress: 90, target: '₹2,50,000', raised: '₹2,25,000' },
      ].map((project, index) => (
        <div key={index}>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span className="font-medium">{project.name}</span>
            <span>{project.raised} / {project.target}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function AdminDashboard() {
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
            <p className="mt-2 text-gray-600">Welcome back! Here's what's happening with HopeBridge today.</p>
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
            <motion.div
              key={stat.name}
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
              {recentActivities.map((activity) => (
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
              ))}
            </div>
          </motion.div>

          {/* Upcoming Events & Quick Stats */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white shadow-lg rounded-xl border border-gray-200"
            >
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100/50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-primary-600" />
                  Upcoming Events
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="px-6 py-4 hover:bg-primary-50/30 transition-colors duration-150 group">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary-700 transition-colors duration-200">
                          {event.title}
                        </h4>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <CalendarIcon className="h-4 w-4 mr-1 text-primary-400" />
                          {event.date}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPinIcon className="h-4 w-4 mr-1 text-primary-400" />
                          {event.location}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          event.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }`}>
                          {event.status}
                        </span>
                        <div className="mt-1 text-sm text-gray-500 flex items-center justify-end">
                          <UserGroupIcon className="h-4 w-4 mr-1 text-primary-400" />
                          {event.volunteers} volunteers
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                <div className="text-center p-3 bg-primary-500/20 rounded-lg backdrop-blur-sm">
                  <div className="text-2xl font-bold">15</div>
                  <div className="text-primary-100 text-sm">Active Projects</div>
                </div>
                <div className="text-center p-3 bg-primary-500/20 rounded-lg backdrop-blur-sm">
                  <div className="text-2xl font-bold">89%</div>
                  <div className="text-primary-100 text-sm">Success Rate</div>
                </div>
                <div className="text-center p-3 bg-primary-500/20 rounded-lg backdrop-blur-sm">
                  <div className="text-2xl font-bold">24</div>
                  <div className="text-primary-100 text-sm">Communities</div>
                </div>
                <div className="text-center p-3 bg-primary-500/20 rounded-lg backdrop-blur-sm">
                  <div className="text-2xl font-bold">5</div>
                  <div className="text-primary-100 text-sm">Countries</div>
                </div>
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
          <ProjectProgress />
        </motion.div>
      </div>
    </div>
  );
}