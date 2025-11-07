import { motion } from 'framer-motion';

const milestones = [
  {
    year: '2008',
    title: 'Humble Beginnings',
    description: 'Started with evening classes for 50 children in a small community center, driven by three passionate university students.',
    icon: '🎓',
    color: 'bg-blue-500'
  },
  {
    year: '2012',
    title: 'First Expansion',
    description: 'Launched healthcare initiatives and established our first community health center, reaching 5 villages.',
    icon: '🏥',
    color: 'bg-green-500'
  },
  {
    year: '2016',
    title: 'Strategic Growth',
    description: 'Expanded to economic empowerment programs and formed key international partnerships across 20+ communities.',
    icon: '🌱',
    color: 'bg-purple-500'
  },
  {
    year: '2023',
    title: 'Global Recognition',
    description: 'Awarded for excellence and expanded operations internationally, impacting 10,000+ lives across 3 countries.',
    icon: '🌍',
    color: 'bg-orange-500'
  }
];

export default function TimelineSection() {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Our Journey
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            From a small student initiative to a globally recognized organization creating lasting impact
          </p>
        </motion.div>

        <div className="mt-12 relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-primary-300 to-secondary-300 h-full hidden md:block"></div>
          
          {/* Timeline Items */}
          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`flex flex-col md:flex-row items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } gap-8`}
              >
                {/* Content */}
                <div className="md:w-1/2">
                  <div className={`${index % 2 === 0 ? 'md:text-right' : 'md:text-left'} bg-white rounded-xl p-6 shadow-lg border border-gray-100`}>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white mb-3" style={{ backgroundColor: milestone.color.replace('bg-', '') }}>
                      {milestone.year}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600">
                      {milestone.description}
                    </p>
                  </div>
                </div>

                {/* Icon */}
                <div className="md:w-1/2 flex justify-center">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-white border-4 border-gray-200 flex items-center justify-center text-2xl shadow-lg">
                      {milestone.icon}
                    </div>
                    {index !== milestones.length - 1 && (
                      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-gray-300 hidden md:block"></div>
                    )}
                  </div>
                </div>

                {/* Spacer for alternating layout */}
                <div className="md:w-1/2 hidden md:block"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}