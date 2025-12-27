import { motion } from 'framer-motion';
import { useState } from 'react';
import { StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const testimonials = [
  {
    id: 1,
    name: 'Dr. Priya Sharma',
    role: 'Math Mentor & Professor',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    content: 'Mentoring rural students through EduSync has been incredibly rewarding. Seeing my students gain confidence in mathematics and secure admissions in STEM fields makes every hour worthwhile.',
    rating: 4.8,
    duration: '3 years'
  },
  {
    id: 2,
    name: 'Rajesh Kumar',
    role: 'Career Guidance Mentor',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    content: 'EduSync\'s structured mentorship program allowed me to guide 45 underprivileged students toward meaningful careers. The platform connects mentors with students who truly need guidance.',
    rating: 4.6,
    duration: '2 years'
  },
  {
    id: 3,
    name: 'Ananya Patel',
    role: 'Scholarship Advisor',
    image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    content: 'Helping students secure over ₹50 lakhs in scholarships has been life-changing. EduSync provides the perfect framework to make education accessible to deserving students.',
    rating: 4.9,
    duration: '1.5 years'
  },
  {
    id: 4,
    name: 'Michael Chen',
    role: 'Digital Literacy Trainer',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    content: 'Teaching digital skills to rural students through EduSync has shown me the power of education to bridge gaps. Our students now confidently use technology for learning and growth.',
    rating: 4.7,
    duration: '2 years'
  }
];

export default function VolunteerTestimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

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
          <h2 className="section-header">Mentor Experiences</h2>
          <p className="section-subheader">
            Hear from our dedicated education mentors about their journey with EduSync
          </p>
        </motion.div>

        <div className="mt-12 relative">
          <div className="max-w-4xl mx-auto">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-50 rounded-2xl p-8 md:p-12"
            >
              <div className="flex items-start space-x-6">
                <img
                  className="h-16 w-16 rounded-full object-cover"
                  src={testimonials[currentTestimonial].image}
                  alt={testimonials[currentTestimonial].name}
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon 
                        key={i} 
                        className={`h-5 w-5 ${
                          i < Math.floor(testimonials[currentTestimonial].rating) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">{testimonials[currentTestimonial].rating}</span>
                  </div>
                  <p className="text-lg text-gray-700 italic mb-4">
                    "{testimonials[currentTestimonial].content}"
                  </p>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonials[currentTestimonial].role} • {testimonials[currentTestimonial].duration} with EduSync
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Navigation */}
            <div className="flex justify-center items-center space-x-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                      index === currentTestimonial ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}