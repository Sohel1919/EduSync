import { motion } from 'framer-motion';
import { HeartIcon, CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import DonateModal from './DonateModal';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; 

// Dummy data for projects
const dummyProjects = [
  {
    id: 1,
    title: "Education for Underprivileged Children",
    summary: "Providing quality education, books, and school supplies to children from low-income families in rural areas.",
    category: "education",
    targetAmount: 500000,
    collectedAmount: 325000,
    deadline: "2024-12-31",
    images: ["https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"],
    tags: ["education", "children", "rural", "school"],
    beneficiaries: 250,
    organization: "Education for All Foundation",
    location: "Rural Maharashtra"
  },
  {
    id: 2,
    title: "Healthcare for Rural Communities",
    summary: "Setting up mobile medical clinics and providing free healthcare services to remote villages.",
    category: "healthcare",
    targetAmount: 750000,
    collectedAmount: 450000,
    deadline: "2024-11-15",
    images: ["https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"],
    tags: ["healthcare", "medical", "rural", "clinic"],
    beneficiaries: 500,
    organization: "Rural Health Initiative",
    location: "Uttar Pradesh"
  },
  {
    id: 3,
    title: "Women Entrepreneurship Program",
    summary: "Empowering women through skill development, business training, and startup funding.",
    category: "women-empowerment",
    targetAmount: 300000,
    collectedAmount: 180000,
    deadline: "2024-10-20",
    images: ["https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"],
    tags: ["women", "entrepreneurship", "empowerment", "skills"],
    beneficiaries: 150,
    organization: "Women Empowerment Trust",
    location: "Karnataka"
  },
  {
    id: 4,
    title: "Clean Water Initiative",
    summary: "Installing water purification systems in villages lacking access to clean drinking water.",
    category: "environment",
    targetAmount: 600000,
    collectedAmount: 420000,
    deadline: "2024-09-30",
    images: ["https://images.unsplash.com/photo-1549037175-e2c8b3030e00?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"],
    tags: ["water", "clean", "environment", "health"],
    beneficiaries: 1000,
    organization: "Clean Water Foundation",
    location: "Rajasthan"
  },
  {
    id: 5,
    title: "Digital Literacy for Seniors",
    summary: "Teaching digital skills to elderly people to help them stay connected and access online services.",
    category: "education",
    targetAmount: 200000,
    collectedAmount: 95000,
    deadline: "2024-08-25",
    images: ["https://images.unsplash.com/photo-1584697964358-3e14ca57658b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"],
    tags: ["digital", "seniors", "technology", "education"],
    beneficiaries: 200,
    organization: "Digital India Foundation",
    location: "Tamil Nadu"
  },
  {
    id: 6,
    title: "Animal Shelter Support",
    summary: "Providing food, medical care, and shelter for stray and abandoned animals in the city.",
    category: "animal-welfare",
    targetAmount: 400000,
    collectedAmount: 275000,
    deadline: "2024-12-15",
    images: ["https://images.unsplash.com/photo-1455103493930-a116f655b6c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"],
    tags: ["animals", "shelter", "welfare", "rescue"],
    beneficiaries: 300,
    organization: "Animal Care Trust",
    location: "Delhi NCR"
  },
  {
    id: 7,
    title: "Youth Sports Development",
    summary: "Creating sports facilities and training programs for underprivileged youth in urban areas.",
    category: "education",
    targetAmount: 350000,
    collectedAmount: 195000,
    deadline: "2024-11-30",
    images: ["https://images.unsplash.com/photo-1549060279-7e168fce7090?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"],
    tags: ["sports", "youth", "development", "fitness"],
    beneficiaries: 400,
    organization: "Youth Sports Foundation",
    location: "Mumbai"
  },
  {
    id: 8,
    title: "Elderly Care Program",
    summary: "Providing healthcare, nutrition, and companionship for elderly people living alone.",
    category: "healthcare",
    targetAmount: 280000,
    collectedAmount: 165000,
    deadline: "2024-10-15",
    images: ["https://images.unsplash.com/photo-1519494080410-f9aa76cb4283?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"],
    tags: ["elderly", "care", "healthcare", "companionship"],
    beneficiaries: 180,
    organization: "Senior Care Foundation",
    location: "Kerala"
  },
  {
    id: 9,
    title: "Sustainable Farming Initiative",
    summary: "Training farmers in sustainable agricultural practices and providing organic farming resources.",
    category: "environment",
    targetAmount: 450000,
    collectedAmount: 320000,
    deadline: "2024-12-20",
    images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"],
    tags: ["farming", "sustainable", "agriculture", "environment"],
    beneficiaries: 350,
    organization: "Green Agriculture Trust",
    location: "Punjab"
  },
  {
    id: 10,
    title: "Women's Health Awareness",
    summary: "Conducting health camps and awareness programs for women in rural communities.",
    category: "women-empowerment",
    targetAmount: 320000,
    collectedAmount: 210000,
    deadline: "2024-09-25",
    images: ["https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"],
    tags: ["women", "health", "awareness", "rural"],
    beneficiaries: 600,
    organization: "Women Health Initiative",
    location: "Bihar"
  },
  {
    id: 11,
    title: "Wildlife Conservation",
    summary: "Protecting endangered species and their habitats through conservation efforts.",
    category: "animal-welfare",
    targetAmount: 550000,
    collectedAmount: 380000,
    deadline: "2024-12-31",
    images: ["https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"],
    tags: ["wildlife", "conservation", "animals", "environment"],
    beneficiaries: 120,
    organization: "Wildlife Protection Society",
    location: "Assam"
  },
  {
    id: 12,
    title: "Disaster Relief Fund",
    summary: "Providing immediate assistance and rehabilitation for communities affected by natural disasters.",
    category: "healthcare",
    targetAmount: 800000,
    collectedAmount: 520000,
    deadline: "2024-11-10",
    images: ["https://images.unsplash.com/photo-1582213782117-fc15acb73d7d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"],
    tags: ["disaster", "relief", "emergency", "rehabilitation"],
    beneficiaries: 800,
    organization: "Disaster Response Network",
    location: "Multiple States"
  },
  {
    id: 13,
    title: "Vocational Training Center",
    summary: "Establishing vocational training centers to provide job skills to unemployed youth.",
    category: "education",
    targetAmount: 420000,
    collectedAmount: 285000,
    deadline: "2024-10-30",
    images: ["https://images.unsplash.com/photo-1535223289827-42f1e9919769?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"],
    tags: ["vocational", "training", "skills", "employment"],
    beneficiaries: 300,
    organization: "Skill Development Mission",
    location: "Gujarat"
  },
  {
    id: 14,
    title: "Mental Health Support",
    summary: "Providing counseling and mental health services to communities in need.",
    category: "healthcare",
    targetAmount: 380000,
    collectedAmount: 245000,
    deadline: "2024-11-20",
    images: ["https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"],
    tags: ["mental", "health", "counseling", "support"],
    beneficiaries: 450,
    organization: "Mental Wellness Foundation",
    location: "Maharashtra"
  },
  {
    id: 15,
    title: "Tree Plantation Drive",
    summary: "Large-scale tree plantation to combat climate change and restore green cover.",
    category: "environment",
    targetAmount: 250000,
    collectedAmount: 175000,
    deadline: "2024-12-10",
    images: ["https://images.unsplash.com/photo-1574263867128-a3d5c1b1deae?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"],
    tags: ["tree", "plantation", "environment", "climate"],
    beneficiaries: 2000,
    organization: "Green Earth Initiative",
    location: "Haryana"
  },
  {
    id: 16,
    title: "Child Nutrition Program",
    summary: "Providing nutritious meals and supplements to malnourished children in urban slums.",
    category: "healthcare",
    targetAmount: 320000,
    collectedAmount: 195000,
    deadline: "2024-09-15",
    images: ["https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"],
    tags: ["child", "nutrition", "health", "food"],
    beneficiaries: 500,
    organization: "Child Nutrition Trust",
    location: "West Bengal"
  },
  {
    id: 17,
    title: "Rural Library Project",
    summary: "Setting up libraries in rural areas to promote reading and access to knowledge.",
    category: "education",
    targetAmount: 280000,
    collectedAmount: 165000,
    deadline: "2024-10-25",
    images: ["https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"],
    tags: ["library", "books", "education", "rural"],
    beneficiaries: 800,
    organization: "Knowledge for All",
    location: "Odisha"
  },
  {
    id: 18,
    title: "Women Safety Initiative",
    summary: "Creating safe spaces and self-defense training for women in urban areas.",
    category: "women-empowerment",
    targetAmount: 350000,
    collectedAmount: 220000,
    deadline: "2024-11-05",
    images: ["https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"],
    tags: ["women", "safety", "empowerment", "self-defense"],
    beneficiaries: 350,
    organization: "Women Safety Alliance",
    location: "Delhi"
  },
  {
    id: 19,
    title: "Marine Conservation",
    summary: "Protecting marine life and coastal ecosystems through conservation efforts.",
    category: "environment",
    targetAmount: 480000,
    collectedAmount: 310000,
    deadline: "2024-12-28",
    images: ["https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"],
    tags: ["marine", "conservation", "ocean", "environment"],
    beneficiaries: 150,
    organization: "Marine Life Foundation",
    location: "Goa"
  },
  {
    id: 20,
    title: "Special Needs Education",
    summary: "Providing specialized education and support for children with special needs.",
    category: "education",
    targetAmount: 400000,
    collectedAmount: 265000,
    deadline: "2024-11-25",
    images: ["https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"],
    tags: ["special", "needs", "education", "support"],
    beneficiaries: 120,
    organization: "Inclusive Education Trust",
    location: "Karnataka"
  }
];


const ProjectCard = ({ project, onBeneficiaryApply }) => {
  const [showDonateModal, setShowDonateModal] = useState(false);
  const { isAuthenticated, login } = useAuth(); // Updated to use AuthContext

  const progress = (project.collectedAmount / project.targetAmount) * 100;
  const daysLeft = Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24));

  const handleDonateClick = () => {
    if (!isAuthenticated) {
      // Redirect to login page instead of Clerk sign-in
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
    onBeneficiaryApply(project.id);
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
        {/* Project Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={project.images[0] || 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
            }}
          />
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              project.category === 'education' ? 'bg-blue-100 text-blue-800' :
              project.category === 'healthcare' ? 'bg-green-100 text-green-800' :
              project.category === 'women-empowerment' ? 'bg-purple-100 text-purple-800' :
              project.category === 'environment' ? 'bg-teal-100 text-teal-800' :
              project.category === 'animal-welfare' ? 'bg-orange-100 text-orange-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {project.category.replace('-', ' ')}
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded-full">
              {project.beneficiaries} beneficiaries
            </span>
          </div>
        </div>

        {/* Project Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
            {project.title}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-3">
            {project.summary}
          </p>

          {/* Project Details */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
            <div>
              <span className="font-semibold">Organization:</span>
              <p className="truncate">{project.organization}</p>
            </div>
            <div>
              <span className="font-semibold">Location:</span>
              <p className="truncate">{project.location}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>₹{project.collectedAmount.toLocaleString()} raised</span>
              <span>₹{project.targetAmount.toLocaleString()} goal</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-primary-500 to-secondary-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{Math.round(progress)}% funded</span>
              <span className="flex items-center">
                <CalendarIcon className="w-3 h-3 mr-1" />
                {daysLeft > 0 ? `${daysLeft} days left` : 'Completed'}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <motion.button
              onClick={handleDonateClick}
              className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Donate Now
            </motion.button>
            <motion.button
              onClick={handleBeneficiaryClick}
              className="flex items-center justify-center px-4 py-3 border border-primary-600 text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-all duration-200 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title="Apply as Beneficiary"
            >
              <UserGroupIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </motion.button>
          </div>
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

// Export both the component and dummy data
export { dummyProjects };
export default ProjectCard;