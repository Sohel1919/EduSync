import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon, CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import DonateModal from './DonateModal';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext'; 

const ProjectCard = ({ project, onBeneficiaryApply }) => {
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left
  const imageIntervalRef = useRef(null);
  const { isAuthenticated } = useAuth();

  // Get project images - handle cases where images might be empty or have 1-5 images
  const projectImages = project.images && project.images.length > 0 
    ? project.images 
    : ['https://images.unsplash.com/photo-1509099836639-18ba1795216d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'];

  // Auto-scroll images if there are multiple with realistic left-to-right animation
  useEffect(() => {
    if (projectImages.length > 1) {
      imageIntervalRef.current = setInterval(() => {
        setDirection(1); // Always move right for auto-scroll
        setCurrentImageIndex((prevIndex) => 
          prevIndex === projectImages.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000); // 3 seconds
    }

    return () => {
      if (imageIntervalRef.current) {
        clearInterval(imageIntervalRef.current);
      }
    };
  }, [projectImages.length]);

  const handleManualImageChange = (newIndex) => {
    // Determine direction based on current and new index
    const newDirection = newIndex > currentImageIndex ? 1 : -1;
    setDirection(newDirection);
    setCurrentImageIndex(newIndex);
    
    // Reset the auto-scroll timer
    if (imageIntervalRef.current) {
      clearInterval(imageIntervalRef.current);
    }
    imageIntervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrentImageIndex((prevIndex) => 
        prevIndex === projectImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);
  };

  const progress = ((project.collectedAmount || 0) / (project.targetAmount || 1)) * 100;
  const daysLeft = project.deadline 
    ? Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  const handleDonateClick = () => {
    if (!isAuthenticated) {
      window.location.href = '/auth/signin';
      return;
    }
    setShowDonateModal(true);
  };

  const handleBeneficiaryClick = () => {
    if (!isAuthenticated) {
      window.location.href = '/auth/signin';
      return;
    }
    onBeneficiaryApply(project._id || project.id);
  };

  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
  };

  // Animation variants for realistic slide effect
  const imageVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9
    })
  };

  return (
    <>
      <motion.div 
        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
        whileHover={{ y: -4 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Project Image with Realistic Auto-scroll */}
        <div className="relative h-48 overflow-hidden group">
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={currentImageIndex}
              custom={direction}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.4 },
                scale: { duration: 0.4 }
              }}
              className="absolute inset-0"
            >
              <img
                src={projectImages[currentImageIndex]}
                alt={project.title}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            </motion.div>
          </AnimatePresence>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Image Navigation Dots */}
          {projectImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {projectImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleManualImageChange(index);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 transform ${
                    index === currentImageIndex 
                      ? 'bg-white scale-125 shadow-lg' 
                      : 'bg-white/60 hover:bg-white/80 hover:scale-110'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <motion.span 
              className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                project.category === 'education' ? 'bg-blue-500/90 text-white' :
                project.category === 'healthcare' ? 'bg-green-500/90 text-white' :
                project.category === 'empowerment' ? 'bg-purple-500/90 text-white' :
                project.category === 'environment' ? 'bg-teal-500/90 text-white' :
                project.category === 'animal-welfare' ? 'bg-orange-500/90 text-white' :
                project.category === 'disaster-relief' ? 'bg-red-500/90 text-white' :
                'bg-gray-500/90 text-white'
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {project.category ? project.category.replace('-', ' ') : 'General'}
            </motion.span>
          </div>

          {/* Beneficiaries Badge */}
          <div className="absolute top-4 right-4">
            <motion.span 
              className="px-2 py-1 bg-black/70 text-white text-xs rounded-full backdrop-blur-sm flex items-center space-x-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <UserGroupIcon className="w-3 h-3" />
              <span>{project.beneficiaries || 0}</span>
            </motion.span>
          </div>

          {/* Image Counter (only show if multiple images) */}
          {projectImages.length > 1 && (
            <motion.div 
              className="absolute top-4 right-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className="px-2 py-1 bg-black/70 text-white text-xs rounded-full backdrop-blur-sm">
                {currentImageIndex + 1}/{projectImages.length}
              </span>
            </motion.div>
          )}

          {/* Navigation Arrows (shown on hover) */}
          {projectImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = currentImageIndex === 0 ? projectImages.length - 1 : currentImageIndex - 1;
                  handleManualImageChange(newIndex);
                }}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = currentImageIndex === projectImages.length - 1 ? 0 : currentImageIndex + 1;
                  handleManualImageChange(newIndex);
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Project Content */}
        <div className="p-6">
          <motion.h3 
            className="text-xl font-bold text-gray-900 mb-2 line-clamp-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {project.title}
          </motion.h3>
          <motion.p 
            className="text-gray-600 mb-4 line-clamp-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {project.summary}
          </motion.p>

          {/* Project Details */}
          <motion.div 
            className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div>
              <span className="font-semibold">Organization:</span>
              <p className="truncate">{project.organization || 'N/A'}</p>
            </div>
            <div>
              <span className="font-semibold">Location:</span>
              <p className="truncate">{project.location || 'N/A'}</p>
            </div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>₹{(project.collectedAmount || 0).toLocaleString()} raised</span>
              <span>₹{(project.targetAmount || 0).toLocaleString()} goal</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-primary-500 to-secondary-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{Math.round(progress)}% funded</span>
              <span className="flex items-center">
                <CalendarIcon className="w-3 h-3 mr-1" />
                {daysLeft > 0 ? `${daysLeft} days left` : 'Completed'}
              </span>
            </div>
          </motion.div>

          {/* Tags */}
          <motion.div 
            className="flex flex-wrap gap-2 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {(project.tags && project.tags.length > 0 ? project.tags.slice(0, 3) : ['charity', 'donation', 'help']).map((tag, index) => (
              <motion.span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                #{typeof tag === 'string' ? tag : 'support'}
              </motion.span>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="flex space-x-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              onClick={handleDonateClick}
              className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-800 transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">Donate Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-secondary-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </motion.button>
            <motion.button
              onClick={handleBeneficiaryClick}
              className="flex items-center justify-center px-4 py-3 border border-primary-600 text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-all duration-200 group relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title="Apply as Beneficiary"
            >
              <UserGroupIcon className="w-5 h-5 group-hover:scale-110 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-primary-600 opacity-0 group-hover:opacity-5 transition-opacity duration-200" />
            </motion.button>
          </motion.div>
        </div>

        {/* Donate Modal */}
        {showDonateModal && (
          <DonateModal
            project={project}
            onClose={() => setShowDonateModal(false)}
          />
        )}
      </motion.div>
    </>
  );
};

export default ProjectCard;