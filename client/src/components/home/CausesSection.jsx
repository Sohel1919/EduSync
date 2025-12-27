import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { 
  LightBulbIcon, 
  AcademicCapIcon, 
  DevicePhoneMobileIcon 
} from '@heroicons/react/24/outline';
import { image1, image2, image3 } from '../../assets/assets';
const causes = [
  {
    id: 'digital-learning',
    title: 'Digital Learning Initiative',
    description: 'Providing tablets, laptops, and internet access to bridge the digital divide for rural students.',
    icon: <DevicePhoneMobileIcon className="h-12 w-12 text-primary-600" />,
    image: image1
  },
  {
    id: 'scholarship-program',
    title: 'Scholarship Assistance',
    description: 'Comprehensive scholarship programs covering tuition, books, and educational materials for deserving students.',
    icon: <AcademicCapIcon className="h-12 w-12 text-primary-600" />,
    image: image2
  },
  {
    id: 'girl-education',
    title: 'Girl Child Education',
    description: 'Special programs encouraging and supporting female education with mentorship and safe learning environments.',
    icon: <LightBulbIcon className="h-12 w-12 text-primary-600" />,
    image: image3
  },
];

export default function CausesSection() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="section-header">Our Educational Programs</h2>
          <p className="section-subheader">
            Transforming lives through comprehensive educational support and digital learning initiatives
          </p>
        </motion.div>

        <div className="mt-12 space-y-12">
          {causes.map((cause, index) => (
            <motion.div 
              key={index} 
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="md:w-1/2">
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <img
                    className="w-full h-64 md:h-80 object-cover transition-all duration-500 hover:scale-105"
                    src={cause.image}
                    alt={cause.title}
                  />
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="flex justify-center md:justify-start mb-4">
                  {cause.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 text-center md:text-left">{cause.title}</h3>
                <p className="mt-4 text-gray-600 text-center md:text-left">{cause.description}</p>
                <div className="mt-6 text-center md:text-left">
                  <Link
                    to={`/`}
                    className="inline-flex items-center text-primary-600 hover:text-primary-800 font-medium group"
                  >
                    Learn more 
                    <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}