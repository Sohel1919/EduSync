import { motion } from 'framer-motion';
import { 
  MapPinIcon,
  ClockIcon,
  HeartIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const stats = [
  {
    icon: <UserGroupIcon className="h-8 w-8 text-white" />,
    value: '500+',
    label: 'Active Volunteers',
    description: 'Across 50+ communities'
  },
  {
    icon: <ClockIcon className="h-8 w-8 text-white" />,
    value: '10,000+',
    label: 'Hours Contributed',
    description: 'In the last year alone'
  },
  {
    icon: <HeartIcon className="h-8 w-8 text-white" />,
    value: '25,000+',
    label: 'Lives Impacted',
    description: 'Through various programs'
  },
  {
    icon: <MapPinIcon className="h-8 w-8 text-white" />,
    value: '15',
    label: 'Cities Covered',
    description: 'Nationwide presence'
  }
];

export default function VolunteerStats() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-600 text-white shadow-lg"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-white/20 rounded-full">
                  {stat.icon}
                </div>
              </div>
              <div className="text-3xl font-bold mb-2">{stat.value}</div>
              <div className="font-semibold mb-1">{stat.label}</div>
              <div className="text-sm text-primary-100">{stat.description}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}