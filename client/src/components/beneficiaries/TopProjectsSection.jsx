// client/src/components/beneficiaries/TopProjectsSection.jsx
import { motion } from 'framer-motion';
import { StarIcon as StarSolid, StarIcon } from '@heroicons/react/24/outline';

const TopProjectsSection = ({ filteredReviews }) => {
  // Calculate top 5 impactful projects
  const projects = [...new Set(filteredReviews.map(review => review.projectName))];
  
  const topProjects = projects.map(project => {
    const projectReviews = filteredReviews.filter(review => review.projectName === project);
    const avgRating = projectReviews.length > 0 
      ? projectReviews.reduce((sum, review) => sum + review.rating, 0) / projectReviews.length
      : 0;
    return {
      name: project,
      rating: avgRating,
      reviewCount: projectReviews.length
    };
  })
  .filter(project => project.reviewCount > 0)
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 5);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      i < Math.round(rating) ? 
        <StarSolid key={i} className="w-4 h-4 text-yellow-400" /> : 
        <StarIcon key={i} className="w-4 h-4 text-gray-300" />
    ));
  };

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-lg p-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Impactful Projects</h2>
      <div className="space-y-4">
        {topProjects.map((project, index) => (
          <div key={project.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-8 h-8 bg-primary-600 text-white rounded-full font-bold">
                {index + 1}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{project.name}</h4>
                <p className="text-sm text-gray-600">{project.reviewCount} reviews</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">{project.rating.toFixed(1)}</span>
              <div className="flex">
                {renderStars(project.rating)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TopProjectsSection;