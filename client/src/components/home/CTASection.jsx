import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <div className="relative bg-gray-900">
      <div className="relative h-56 bg-primary-600 sm:h-72 md:h-96 overflow-hidden">
        <img
          className="w-full h-full object-cover opacity-70"
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
          alt="Community eating together"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70"></div>
      </div>
      <div className="relative -mt-24 max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
        <motion.div 
          className="mx-auto max-w-2xl text-center rounded-xl bg-white shadow-2xl p-8 sm:p-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            <span className="block">Ready to make an impact?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-gray-600">
            Your support—whether time, money, or voice—helps transform lives every day.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              to="/donation"
              className="btn-primary"
            >
              Donate Now
            </Link>
            <Link
              to="/volunteer"
              className="btn-outline"
            >
              Volunteer
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}