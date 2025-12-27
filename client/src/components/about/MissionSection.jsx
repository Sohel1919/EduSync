import { motion } from 'framer-motion';

export default function MissionSection({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'mission', label: 'Our Mission' },
    { id: 'vision', label: 'Our Vision' },
    { id: 'values', label: 'Our Values' },
  ];

  const tabContent = {
    mission: {
      title: 'Bridging Educational Gaps Through Innovation',
      content: 'We are committed to empowering underprivileged and rural students by providing free quality education, digital learning resources, mentorship programs, and scholarship assistance. Our mission is to break the cycle of poverty through education and create equal opportunities for every child.',
      features: ['Free Education', 'Digital Learning', 'Scholarship Support']
    },
    vision: {
      title: 'A World Where Every Child Learns',
      content: 'We envision communities where every child has access to quality education regardless of their socioeconomic background. A future where geographic location and financial constraints no longer determine a child\'s educational journey and career prospects.',
      features: ['Equal Access', 'Quality Education', 'Bright Futures']
    },
    values: {
      title: 'Guided by Educational Excellence and Compassion',
      content: 'Our work is rooted in core values that prioritize student success, innovation in education, and the transformative power of learning. We believe in transparency, dedication, and the limitless potential of every student we serve.',
      features: ['Excellence', 'Innovation', 'Compassion', 'Integrity']
    }
  };

  return (
    <div className="relative py-16 bg-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute left-0 top-0 w-1/3 h-full bg-gradient-to-r from-primary-50 to-transparent"></div>
      <div className="absolute right-0 bottom-0 w-1/3 h-full bg-gradient-to-l from-secondary-50 to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            What Drives EduSync
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Our foundation is built on educational principles that guide our mission to empower students
          </p>
        </motion.div>

        <motion.div 
          className="mt-12 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="grid md:grid-cols-3">
            {/* Tab Navigation */}
            <div className="bg-gray-50 p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id 
                        ? 'bg-white shadow-md border border-gray-200 text-primary-600 font-semibold' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content Area */}
            <div className="md:col-span-2 p-8">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {tabContent[activeTab].title}
                </h3>
                <p className="text-gray-600 leading-relaxed flex-grow">
                  {tabContent[activeTab].content}
                </p>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-3">
                    {tabContent[activeTab].features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}