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
    title: 'Transform Young Lives',
    description: 'Directly impact underprivileged students by helping them access quality education and achieve their dreams.'
  },
  {
    icon: <AcademicCapIcon className="h-8 w-8 text-primary-600" />,
    title: 'Share Your Knowledge',
    description: 'Use your academic expertise to guide students and help bridge educational gaps in underserved communities.'
  },
  {
    icon: <UserGroupIcon className="h-8 w-8 text-primary-600" />,
    title: 'Join Education Champions',
    description: 'Connect with passionate educators and professionals committed to educational equity.'
  },
  {
    icon: <ClockIcon className="h-8 w-8 text-primary-600" />,
    title: 'Flexible Volunteering',
    description: 'Contribute according to your schedule with online and in-person mentoring options.'
  },
  {
    icon: <ChartBarIcon className="h-8 w-8 text-primary-600" />,
    title: 'Professional Development',
    description: 'Enhance your teaching, mentoring, and leadership skills while making a difference.'
  },
  {
    icon: <GiftIcon className="h-8 w-8 text-primary-600" />,
    title: 'Recognition & Certificates',
    description: 'Receive volunteer certificates, awards, and recognition for your educational contributions.'
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
          <h2 className="section-header">Why Mentor With EduSync?</h2>
          <p className="section-subheader">
            Join our education revolution and help shape the future of underprivileged students
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
            <h3 className="text-2xl font-bold mb-4">Ready to Mentor a Student?</h3>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Join hundreds of education volunteers who are transforming lives through mentorship. 
              Your knowledge can unlock a student's potential and create lasting educational impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl">
                Become a Mentor
              </button>
              <button className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition-all duration-300">
                Learn About Programs
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}