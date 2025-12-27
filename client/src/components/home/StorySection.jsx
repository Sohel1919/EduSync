import { motion } from 'framer-motion';
import { image4 } from '../../assets/assets';
export default function StorySection({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'mission', label: 'Our Mission' },
    { id: 'vision', label: 'Our Vision' },
    { id: 'values', label: 'Our Values' },
  ];

  const tabContent = {
    mission: {
      title: 'Bridging Educational Gaps',
      content: 'Founded in 2016, EduSync began with a simple mission: to provide equal educational opportunities to underprivileged and rural students. Today, we have evolved into a comprehensive educational support organization, delivering digital learning resources, scholarships, mentorship, and skill development programs to transform young lives through education.'
    },
    vision: {
      title: 'Education Without Barriers',
      content: 'We envision a world where every child, regardless of their background or location, has access to quality education, digital learning tools, and mentorship opportunities. Our programs are designed to create lifelong learners who can break the cycle of poverty through education and become leaders in their communities.'
    },
    values: {
      title: 'Guided by Educational Excellence',
      content: 'Equity: We believe every student deserves equal access to quality education.\nInnovation: We leverage technology to create scalable learning solutions.\nEmpowerment: We equip students with knowledge, skills, and confidence to shape their futures.\nExcellence: We maintain the highest standards in all our educational programs and mentorship initiatives.'
    }
  };

  return (
    <div className="relative py-16 bg-gray-50 overflow-hidden">
      <div className="hidden lg:block lg:absolute lg:inset-y-0 lg:h-full lg:w-full">
        <div className="relative h-full max-w-7xl mx-auto" aria-hidden="true">
          <div className="absolute transform rotate-45 bg-gradient-to-r from-primary-200 to-secondary-200 rounded-full h-64 w-64 -top-8 -left-8 opacity-20"></div>
          <div className="absolute transform bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full h-96 w-96 -bottom-32 -right-16 opacity-20"></div>
        </div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="section-header">Our Educational Journey</h2>
          <p className="section-subheader">
            From a small tutoring initiative to a nationwide educational movement
          </p>
        </motion.div>

        <motion.div 
          className="mt-12 bg-white shadow-xl rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="grid md:grid-cols-2">
            <div className="p-8 sm:p-12">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="mt-6">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-2xl font-bold text-gray-900">{tabContent[activeTab].title}</h3>
                  <p className="mt-4 text-lg text-gray-600 whitespace-pre-line">
                    {tabContent[activeTab].content}
                  </p>
                </motion.div>
              </div>
            </div>
            <div className="hidden md:block relative">
              <img
                className="absolute inset-0 h-full w-full object-cover"
                src={image4}
                alt="Students learning in classroom"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}