import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

const ClerkThemeWrapper = ({ type = 'sign-in' }) => {
  const clerkAppearance = {
    elements: {
      rootBox: "mx-auto w-full",
      card: "bg-transparent shadow-none",
      header: "text-center",
      headerTitle: "text-2xl font-bold text-white",
      headerSubtitle: "text-primary-100",
      socialButtonsBlockButton: 
        "bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300",
      socialButtonsBlockButtonText: "text-white",
      dividerLine: "bg-white/20",
      dividerText: "text-white",
      formFieldLabel: "text-white font-medium",
      formFieldInput: 
        "bg-white/10 border border-white/20 text-white placeholder-primary-200 focus:bg-white/20 focus:border-white/40 transition-all duration-300",
      formButtonPrimary:
        "bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl",
      footer: "text-center",
      footerActionLink: "text-primary-200 hover:text-white transition-colors duration-300",
      identityPreviewEditButton: "text-primary-200 hover:text-white",
      formResendCodeLink: "text-primary-200 hover:text-white",
      alert: "bg-white/10 border border-white/20 text-white",
    },
    layout: {
      shimmer: true,
      socialButtonsVariant: 'blockButton',
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-secondary-500 to-primary-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg font-bold">CS</span>
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">CareSync</h1>
          <p className="text-primary-200">
            {type === 'sign-in' ? 'Welcome back to your dashboard' : 'Join our community today'}
          </p>
        </div>

        {/* Clerk Component */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-2xl">
          {type === 'sign-in' ? (
            <SignIn 
              appearance={clerkAppearance}
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              redirectUrl="/dashboard"
            />
          ) : (
            <SignUp 
              appearance={clerkAppearance}
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              redirectUrl="/onboarding"
            />
          )}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6"
        >
          <p className="text-primary-200 text-sm">
            {type === 'sign-in' 
              ? "Making a difference together" 
              : "Start your journey with CareSync"
            }
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ClerkThemeWrapper;