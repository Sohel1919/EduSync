import { motion } from 'framer-motion';
import { images } from '../../assets/assets';
const team = [
  {
    name: 'Shaikh Sohel',
    role: 'Executive Director',
    image: images.sohel,
    bio: '15+ years in educational leadership with expertise in rural education development and digital learning initiatives.',
  },
  {
    name: 'Pradeep Haldekar',
    role: 'Program Director',
    image: images.pradeep,
    bio: 'Specialized in designing scalable education programs, scholarship systems, and community outreach strategies.',
  },
  {
    name: 'Shejal Burele',
    role: 'Operations Director',
    image: images.shejal,
    bio: 'Expert in educational operations, volunteer coordination, and implementing digital learning infrastructure.',
  },
  {
    name: 'Tryambak Panchal',
    role: 'Technology Lead',
    image: images.tryambak,
    bio: 'Building digital education platforms and e-learning solutions to enhance remote learning accessibility.',
  }
];

export default function TeamSection() {
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
            Meet Our Education Leaders
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Passionate educators and professionals dedicated to transforming student futures through innovative learning solutions
          </p>
        </motion.div>

        <motion.div 
          className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="h-64 overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                <p className="text-primary-600 font-semibold mt-1">{member.role}</p>
                <p className="text-gray-600 text-sm mt-3 leading-relaxed">{member.bio}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}