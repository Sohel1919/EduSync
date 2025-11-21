import { motion } from 'framer-motion';
import { 
  HeartIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ClockIcon,
  ChartBarIcon,
  GiftIcon
} from '@heroicons/react/24/outline';

const benefits = [
  {
    icon: <HeartIcon className="h-8 w-8 text-primary-600" />,
    title: 'Make a Real Impact',
    description: 'Directly contribute to transforming lives and communities through meaningful work.'
  },
  {
    icon: <AcademicCapIcon className="h-8 w-8 text-primary-600" />,
    title: 'Skill Development',
    description: 'Gain valuable experience and develop new skills in community service and leadership.'
  },
  {
    icon: <UserGroupIcon className="h-8 w-8 text-primary-600" />,
    title: 'Join a Community',
    description: 'Connect with like-minded individuals passionate about making a difference.'
  },
  {
    icon: <ClockIcon className="h-8 w-8 text-primary-600" />,
    title: 'Flexible Commitment',
    description: 'Volunteer according to your schedule with various time commitment options.'
  },
  {
    icon: <ChartBarIcon className="h-8 w-8 text-primary-600" />,
    title: 'Career Growth',
    description: 'Enhance your resume with impactful volunteer experience and references.'
  },
  {
    icon: <GiftIcon className="h-8 w-8 text-primary-600" />,
    title: 'Recognition',
    description: 'Receive certificates, awards, and recognition for your valuable contributions.'
  }
];

export default function VolunteerBenefits() {
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
          <h2 className="section-header">Why Volunteer With Us?</h2>
          <p className="section-subheader">
            Join our community and experience the rewards of making a difference
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Join hundreds of volunteers who are already making a difference in their communities. 
              Your time and skills can create lasting change.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl">
                Apply as Volunteer
              </button>
              <button className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}