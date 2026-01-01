// components/Loader.jsx
import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ type = "default", size = "medium", message = "Loading..." }) => {
  // Main animated loader component
  const MainLoader = () => (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated Logo/Icon */}
        <motion.div
          className="relative mx-auto mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Outer rotating ring */}
          <motion.div
            className={`${
              size === "small" ? "w-12 h-12" :
              size === "large" ? "w-24 h-24" : "w-16 h-16"
            } border-4 border-primary-200 rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner pulsing circle */}
          <motion.div
            className={`${
              size === "small" ? "w-8 h-8" :
              size === "large" ? "w-16 h-16" : "w-12 h-12"
            } bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.8, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Floating particles */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`${
                size === "small" ? "w-1 h-1" :
                size === "large" ? "w-2 h-2" : "w-1.5 h-1.5"
              } bg-secondary-500 rounded-full absolute`}
              style={{
                top: '50%',
                left: '50%',
              }}
              animate={{
                x: [
                  size === "small" ? -20 : size === "large" ? -40 : -30,
                  size === "small" ? -10 : size === "large" ? -20 : -15,
                  size === "small" ? -20 : size === "large" ? -40 : -30,
                ],
                y: [
                  size === "small" ? -10 : size === "large" ? -20 : -15,
                  size === "small" ? -20 : size === "large" ? -40 : -30,
                  size === "small" ? -10 : size === "large" ? -20 : -15,
                ],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>

        {/* Loading text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-gray-600 font-medium mb-2">{message}</p>
          
          {/* Progress dots */}
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((dot) => (
              <motion.div
                key={dot}
                className="w-2 h-2 bg-primary-500 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: dot * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  // Card loader for inline content
  const CardLoader = () => (
    <motion.div
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center space-x-4">
        {/* Animated avatar */}
        <motion.div
          className="w-12 h-12 bg-gray-200 rounded-full"
          animate={{
            background: [
              "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)",
              "linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)",
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        
        <div className="flex-1 space-y-3">
          {/* Animated text lines */}
          <motion.div
            className="h-4 bg-gray-200 rounded"
            animate={{
              background: [
                "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)",
                "linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)",
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="h-4 bg-gray-200 rounded w-3/4"
            animate={{
              background: [
                "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)",
                "linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)",
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
        </div>
      </div>
    </motion.div>
  );

  // Button loader
  const ButtonLoader = () => (
    <motion.div
      className="inline-flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.span
        className="ml-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.span>
    </motion.div>
  );

  // Page transition loader
  const PageTransitionLoader = () => (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        {/* CareSync branded loader */}
        <motion.div
          className="relative mx-auto mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {/* Main logo container */}
          <div className="w-20 h-20 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl font-bold">ES</span>
          </div>
          
          {/* Orbiting elements */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-gradient-to-r from-primary-400 to-secondary-500 rounded-full"
              animate={{
                rotate: 360,
                x: 40 * Math.cos((i * 120 * Math.PI) / 180),
                y: 40 * Math.sin((i * 120 * Math.PI) / 180),
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.3,
              }}
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
            EduSync
          </h3>
          <p className="text-gray-600 mb-6">Making a difference together</p>
          
          {/* Progress bar */}
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-secondary-600"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );

  // Return appropriate loader based on type
  switch (type) {
    case "card":
      return <CardLoader />;
    case "button":
      return <ButtonLoader />;
    case "page":
      return <PageTransitionLoader />;
    default:
      return <MainLoader />;
  }
};

// Hook for managing loading states
export const useLoader = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState("Loading...");

  const showLoader = (message = "Loading...") => {
    setLoadingMessage(message);
    setIsLoading(true);
  };

  const hideLoader = () => {
    setIsLoading(false);
    setLoadingMessage("Loading...");
  };

  return {
    isLoading,
    loadingMessage,
    showLoader,
    hideLoader,
    Loader: () => isLoading && <Loader message={loadingMessage} />,
  };
};

export default Loader;