// client/src/components/beneficiaries/WordCloudSection.jsx
import { motion } from 'framer-motion';
import { ChartBarIcon } from '@heroicons/react/24/outline';

// Word cloud data based on common keywords from reviews
const wordCloudData = [
  { text: "education", value: 35 },
  { text: "healthcare", value: 28 },
  { text: "support", value: 25 },
  { text: "life-changing", value: 22 },
  { text: "community", value: 20 },
  { text: "empowerment", value: 18 },
  { text: "clean water", value: 16 },
  { text: "opportunity", value: 15 },
  { text: "transformation", value: 14 },
  { text: "hope", value: 12 },
  { text: "sustainable", value: 11 },
  { text: "development", value: 10 }
];

const WordCloudSection = () => {
  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-lg p-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Community Sentiment</h2>
        <ChartBarIcon className="w-6 h-6 text-primary-600" />
      </div>
      <div className="flex flex-wrap gap-4 justify-center">
        {wordCloudData.map((word, index) => (
          <motion.span
            key={word.text}
            className={`px-4 py-2 rounded-full font-medium cursor-pointer transition-all hover:scale-105 ${
              index < 3 ? 'bg-primary-100 text-primary-800 text-lg' :
              index < 6 ? 'bg-secondary-100 text-secondary-800' :
              'bg-gray-100 text-gray-700'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.1 }}
          >
            {word.text}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};

export default WordCloudSection;