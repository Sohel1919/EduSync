import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HeartIcon, UsersIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function VolunteerHero() {
  return (
    <div className="relative bg-gradient-to-br from-primary-600 to-secondary-700 overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="block">Empower Through</span>
            <span className="block text-primary-200">Education Mentorship</span>
          </motion.h1>
          <motion.p 
            className="mt-6 max-w-2xl mx-auto text-xl text-primary-100"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Join EduSync in bridging educational gaps for underprivileged students. 
            Share your knowledge, guide young minds, and help build brighter futures through quality education.
          </motion.p>
          <motion.div 
            className="mt-10 flex justify-center space-x-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Link
              to="/auth/signup?role=volunteer"
              className="btn-primary"
            >
              Become an Education Mentor
            </Link>
            <Link
              to="/volunteer/dashboard"
              className="btn-outline border-white text-white hover:bg-white hover:text-primary-700"
            >
              Mentor Portal
            </Link>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Quick Stats */}
      <div className="relative bg-white/10 backdrop-blur-sm border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-white"
            >
              <UsersIcon className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">450+</div>
              <div className="text-primary-100">Active Education Mentors</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="text-white"
            >
              <HeartIcon className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">15,000+</div>
              <div className="text-primary-100">Mentoring Hours</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="text-white"
            >
              <ClockIcon className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">3,200+</div>
              <div className="text-primary-100">Students Supported</div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}