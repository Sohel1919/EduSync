import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-primary-600 to-secondary-700 overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <motion.div 
        className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center">
          <motion.h1 
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="block">Empowering Students</span>
            <span className="block text-primary-200">Transforming Futures</span>
          </motion.h1>
          <motion.p 
            className="mt-6 max-w-lg mx-auto text-xl text-primary-100"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Bridging educational gaps for underprivileged and rural students through technology, mentorship, and scholarships.
          </motion.p>
          <motion.div 
            className="mt-10 flex justify-center space-x-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Link
              to="/donation"
              className="btn-primary"
            >
              Support Education
            </Link>
            <Link
              to="/join-our-team"
              className="btn-outline border-white text-white hover:bg-white hover:text-primary-700"
            >
              Become a Mentor
            </Link>
          </motion.div>
        </div>
      </motion.div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
    </div>
  );
}