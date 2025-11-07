import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  UsersIcon, 
  BookOpenIcon,
  HandRaisedIcon
} from '@heroicons/react/24/outline';

const stats = [
  { value: '10,000+', label: 'Lives Impacted', icon: <HeartIcon className="h-8 w-8 text-white" /> },
  { value: '500+', label: 'Volunteers', icon: <UsersIcon className="h-8 w-8 text-white" /> },
  { value: '50+', label: 'Communities', icon: <BookOpenIcon className="h-8 w-8 text-white" /> },
  { value: '15', label: 'Years Serving', icon: <HandRaisedIcon className="h-8 w-8 text-white" /> },
];

export default function StatsSection() {
  return (
    <div className="relative -mt-12 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-600 shadow-xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-primary-400/20">
              {stats.map((stat, index) => (
                <motion.div 
                  key={index} 
                  className="px-4 py-8 sm:p-8 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <div className="flex justify-center mb-3">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="mt-2 text-sm font-medium text-primary-100">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}