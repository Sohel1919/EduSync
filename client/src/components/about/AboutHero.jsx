import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function AboutHero() {
  return (
    <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="absolute inset-0 bg-black opacity-5"></div>
      
      <motion.div 
        className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center px-6 py-3 rounded-full bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 mb-8"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
            <span className="text-primary-100 font-medium">Empowering Students Since 2010</span>
          </motion.div>

          <motion.h1 
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span className="block">Transforming Lives Through</span>
            <span className="block text-primary-200 bg-gradient-to-r from-primary-200 to-secondary-200 bg-clip-text text-transparent">
              Education & Opportunity
            </span>
          </motion.h1>
          
          <motion.p 
            className="mt-6 max-w-2xl mx-auto text-xl text-primary-100"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            For over a decade, we've been dedicated to bridging educational gaps by providing 
            free quality education, digital learning resources, mentorship, and scholarship 
            opportunities to underprivileged students across rural communities.
          </motion.p>
          
          <motion.div 
            className="mt-10 flex justify-center space-x-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Link
              to="/donation"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-700 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Support Education
            </Link>
            <Link
              to="/join-our-team"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-700 transition-all duration-300"
            >
              Become a Mentor
            </Link>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Stats Bar */}
      <motion.div 
        className="relative bg-white bg-opacity-95 backdrop-blur-sm border-t border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 py-8">
            {[
              { number: '14+', label: 'Years of Impact' },
              { number: '75+', label: 'Rural Communities' },
              { number: '25K+', label: 'Students Empowered' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-primary-600">{stat.number}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}