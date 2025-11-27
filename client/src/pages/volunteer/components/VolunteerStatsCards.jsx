import { motion } from 'framer-motion';
import { 
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function VolunteerStatsCards({ projects }) {
  const stats = [
    { 
      name: 'Total Projects', 
      value: projects.length, 
      color: 'bg-blue-500',
      description: 'All your projects',
      icon: UsersIcon
    },
    { 
      name: 'Pending', 
      value: projects.filter(p => p.isApproved === 'pending').length, 
      color: 'bg-yellow-500',
      description: 'Awaiting approval',
      icon: ClockIcon
    },
    { 
      name: 'Approved', 
      value: projects.filter(p => p.isApproved === 'approved').length, 
      color: 'bg-green-500',
      description: 'Active projects',
      icon: CheckCircleIcon
    },
    { 
      name: 'Rejected', 
      value: projects.filter(p => p.isApproved === 'rejected').length, 
      color: 'bg-red-500',
      description: 'Projects not approved',
      icon: XCircleIcon
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stat.value}</dd>
                  <dd className="text-xs text-gray-500">{stat.description}</dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}