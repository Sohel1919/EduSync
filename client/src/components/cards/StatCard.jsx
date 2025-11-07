import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, change, color = 'primary' }) => {
  const colorClasses = {
    primary: 'from-primary-500 to-secondary-500',
    success: 'from-green-500 to-emerald-500',
    warning: 'from-yellow-500 to-orange-500',
    error: 'from-red-500 to-pink-500',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="dashboard-card group"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <motion.p
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold gradient-text mt-2"
          >
            {value}
          </motion.p>
          {change && (
            <p className={`text-sm mt-1 ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
            </p>
          )}
        </div>
        
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
          className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} text-white`}
        >
          <Icon size={24} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StatCard;