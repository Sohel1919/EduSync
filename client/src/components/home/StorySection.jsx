import { motion } from 'framer-motion';

export default function StorySection({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'mission', label: 'Our Mission' },
    { id: 'vision', label: 'Our Vision' },
    { id: 'values', label: 'Our Values' },
  ];

  const tabContent = {
    mission: {
      title: 'Creating Lasting Change',
      content: 'Founded in 2008, we began with a simple mission: to bring quality education to rural villages. Today, we\'ve grown into a comprehensive community development organization, but our core purpose remains unchanged - to empower people to break the cycle of poverty.'
    },
    vision: {
      title: 'A World of Equal Opportunity',
      content: 'We envision communities where every child has access to education, every family has healthcare, and every woman has economic opportunities. Our programs are designed to create systemic change that lasts for generations.'
    },
    values: {
      title: 'Guided by Compassion',
      content: 'Integrity: We\'re accountable to our donors and the communities we serve.\nInnovation: We constantly seek better solutions to complex problems.\nInclusion: We believe everyone deserves dignity and opportunity.'
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
          <h2 className="section-header">Our Story</h2>
          <p className="section-subheader">
            How a small group of volunteers grew into a movement
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
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Community volunteers"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}