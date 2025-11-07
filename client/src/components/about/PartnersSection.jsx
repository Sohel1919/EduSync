import { motion } from 'framer-motion';

const partners = [
  {
    name: 'UN Development Program',
    logo: 'https://logos-world.net/wp-content/uploads/2020/04/United-Nations-Emblem.png',
    type: 'Strategic Partner'
  },
  {
    name: 'Global Health Initiative',
    logo: 'https://logos-world.net/wp-content/uploads/2020/12/WHO-Emblem.png',
    type: 'Healthcare Partner'
  },
  {
    name: 'Education First Foundation',
    logo: 'https://logos-world.net/wp-content/uploads/2021/11/UNESCO-Emblem.png',
    type: 'Education Partner'
  },
  {
    name: 'Women Empowerment Alliance',
    logo: 'https://logos-world.net/wp-content/uploads/2021/09/UN-Women-Logo.png',
    type: 'Empowerment Partner'
  }
];

export default function PartnersSection() {
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
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Our Trusted Partners
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Collaborating with leading organizations to amplify our impact and reach
          </p>
        </motion.div>

        <motion.div 
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {partners.map((partner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="h-16 mb-4 flex items-center justify-center">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-12 max-w-full object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
                />
              </div>
              <div className="text-sm font-semibold text-gray-900">{partner.name}</div>
              <div className="text-xs text-primary-600 mt-1">{partner.type}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-600 mb-6">
            Interested in partnering with us to create greater impact?
          </p>
          <button className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-300">
            Become a Partner
          </button>
        </motion.div>
      </div>
    </div>
  );
}