// client/src/pages/UnauthorizedPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldExclamationIcon, HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg">
              <ShieldExclamationIcon className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">!</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
            Access Denied
          </h1>
          
          <p className="text-gray-600 text-lg mb-2">
            You don't have permission to access this page
          </p>
          
          <p className="text-gray-500 mb-8">
            This area requires special privileges. Please contact an administrator if you believe this is a mistake.
          </p>

          {/* Role Information */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-8 border border-gray-200 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Available Roles</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-primary-50 text-primary-700 px-2 py-1 rounded">User</div>
              <div className="bg-secondary-50 text-secondary-700 px-2 py-1 rounded">Donor</div>
              <div className="bg-green-50 text-green-700 px-2 py-1 rounded">Volunteer</div>
              <div className="bg-purple-50 text-purple-700 px-2 py-1 rounded">Beneficiary</div>
              <div className="bg-red-50 text-red-700 px-2 py-1 rounded col-span-2">Admin</div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:from-primary-700 hover:to-secondary-700"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Go Home
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-gray-50"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Go Back
            </button>
          </motion.div>

          {/* Support Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200"
          >
            <p className="text-sm text-blue-700">
              Need access?{' '}
              <Link to="/contact" className="font-semibold hover:text-blue-800 underline">
                Contact support
              </Link>{' '}
              or check your role permissions.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UnauthorizedPage;