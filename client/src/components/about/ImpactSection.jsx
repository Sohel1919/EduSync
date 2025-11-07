import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  UsersIcon, 
  BookOpenIcon,
  HandRaisedIcon 
} from '@heroicons/react/24/outline';

const stats = [
  { value: '10,000+', label: 'Lives Impacted', icon: <HeartIcon className="h-8 w-8 text-white" /> },
  { value: '500+', label: 'Volunteers', icon: <UsersIcon className="h-8 w-8 text-white" /> },
  { value: '50+', label: 'Communities', icon: <BookOpenIcon className="h-8 w-8 text-white" /> },
  { value: '15', label: 'Years Serving', icon: <HandRaisedIcon className="h-8 w-8 text-white" /> },
];

const impactStories = [
  {
    title: 'Education Transformation',
    location: 'Rural Kenya',
    impact: '85% increase in school enrollment',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    description: 'Built schools and provided scholarships to children in remote communities.'
  },
  {
    title: 'Healthcare Access',
    location: 'Mountain Nepal',
    impact: '60% reduction in child mortality',
    image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    description: 'Mobile clinics serving patients in inaccessible mountain regions.'
  }
];

export default function ImpactSection() {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Our Impact in Numbers
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Measurable results that represent real change in communities we serve
          </p>
        </motion.div>

        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-600 shadow-xl overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-primary-400/20">
              {stats.map((stat, index) => (
                <motion.div 
                  key={index} 
                  className="px-4 py-8 sm:p-8 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="flex justify-center mb-3">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="mt-2 text-sm font-medium text-primary-100">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Impact Stories */}
        <motion.div 
          className="mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Stories of Transformation
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            {impactStories.map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
                      {story.location}
                    </span>
                    <span className="text-sm text-gray-500 font-medium">{story.impact}</span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{story.title}</h4>
                  <p className="text-gray-600 text-sm">{story.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}