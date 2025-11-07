// client/src/components/beneficiaries/ReviewCard.jsx
// client/src/components/beneficiaries/ReviewCard.jsx
import { motion } from 'framer-motion';
import { HeartIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useState } from 'react';


// Dummy data for 100 beneficiary reviews
export const dummyReviews = Array.from({ length: 100 }, (_, index) => {
  const projects = [
    { name: "Education for Underprivileged Children", category: "education" },
    { name: "Healthcare for Rural Communities", category: "healthcare" },
    { name: "Women Entrepreneurship Program", category: "women-empowerment" },
    { name: "Clean Water Initiative", category: "environment" },
    { name: "Digital Literacy for Seniors", category: "education" },
    { name: "Animal Shelter Support", category: "animal-welfare" },
    { name: "Youth Sports Development", category: "education" },
    { name: "Elderly Care Program", category: "healthcare" },
    { name: "Sustainable Farming Initiative", category: "environment" },
    { name: "Women's Health Awareness", category: "women-empowerment" }
  ];

  const project = projects[Math.floor(Math.random() * projects.length)];
  const rating = Math.floor(Math.random() * 3) + 3; // 3-5 stars
  const reviewTexts = [
    "This project completely transformed our community. The education provided to our children has opened up new opportunities we never thought possible.",
    "The healthcare services brought to our village saved many lives. We are forever grateful for the medical support and care provided.",
    "As a woman entrepreneur, the training and funding I received helped me start my own business and become financially independent.",
    "Clean water has changed everything for our family. No more waterborne diseases and we can focus on other important aspects of life.",
    "Learning digital skills at my age seemed impossible, but the patient teachers made it easy. Now I can video call my grandchildren!",
    "The animal shelter provided care for stray animals in our area. The compassion shown to these creatures restored our faith in humanity.",
    "Sports gave our youth a positive outlet and taught them valuable life skills like teamwork and discipline.",
    "The elderly care program brought comfort and medical attention to our senior citizens who were living alone and struggling.",
    "Sustainable farming techniques have doubled our crop yield while protecting the environment. A win-win for everyone!",
    "Women's health awareness camps detected early signs of diseases and provided treatment that saved lives in our community."
  ];

  const names = [
    "Priya Sharma", "Raj Kumar", "Anita Patel", "Suresh Reddy", "Meena Iyer",
    "Vikram Singh", "Lakshmi Nair", "Arun Mehta", "Sunita Joshi", "Rahul Verma",
    "Kavita Desai", "Mohan Krishna", "Deepa Choudhury", "Sanjay Malhotra", "Pooja Agarwal"
  ];

  return {
    id: index + 1,
    beneficiaryName: names[Math.floor(Math.random() * names.length)],
    profileImage: `https://images.unsplash.com/photo-${1500000000000 + index}-1280x720?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80&crop=face&fit=face`,
    projectName: project.name,
    projectCategory: project.category,
    rating: rating,
    reviewText: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
    date: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    helpful: Math.floor(Math.random() * 50)
  };
});

const ReviewCard = ({ review, index }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpansion = () => {
    setExpanded(!expanded);
  };

  const getCategoryColor = (category) => {
    const colors = {
      education: 'bg-blue-100 text-blue-800',
      healthcare: 'bg-green-100 text-green-800',
      'women-empowerment': 'bg-purple-100 text-purple-800',
      environment: 'bg-teal-100 text-teal-800',
      'animal-welfare': 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      i < rating ? 
        <StarSolid key={i} className="w-5 h-5 text-yellow-400" /> : 
        <StarIcon key={i} className="w-5 h-5 text-gray-300" />
    ));
  };

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={review.profileImage}
            alt={review.beneficiaryName}
            className="w-12 h-12 rounded-full object-cover border-2 border-primary-100"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.beneficiaryName)}&background=primary-600&color=fff`;
            }}
          />
          <div>
            <h3 className="font-semibold text-gray-900">{review.beneficiaryName}</h3>
            <p className="text-sm text-gray-500">
              {new Date(review.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Project Info */}
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(review.projectCategory)}`}>
            {review.projectCategory.replace('-', ' ')}
          </span>
          <h4 className="font-medium text-gray-900 mt-2 line-clamp-2">
            {review.projectName}
          </h4>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex">
            {renderStars(review.rating)}
          </div>
          <span className="text-sm font-medium text-gray-700">{review.rating}.0</span>
        </div>

        {/* Review Text */}
        <div className="mb-4">
          <p className="text-gray-600 leading-relaxed">
            {expanded 
              ? review.reviewText
              : review.reviewText.slice(0, 200)
            }
            {review.reviewText.length > 200 && !expanded && '...'}
          </p>
          {review.reviewText.length > 200 && (
            <button
              onClick={toggleExpansion}
              className="text-primary-600 hover:text-primary-800 font-medium text-sm mt-2 transition-colors"
            >
              {expanded ? 'Read Less' : 'Read More'}
            </button>
          )}
        </div>

        {/* Helpful Count */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <HeartIcon className="w-4 h-4" />
            <span>{review.helpful} people found this helpful</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Export both the component and dummy data
export default ReviewCard;