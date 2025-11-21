import { motion } from 'framer-motion';
import { useState } from 'react';
import { StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const testimonials = [
  {
    id: 1,
    name: 'Emily Rodriguez',
    role: 'Education Volunteer',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    content: 'Volunteering with CareSync has been life-changing. I\'ve helped 50+ children improve their reading skills and seen their confidence grow exponentially.',
    rating: 5,
    duration: '2 years'
  },
  {
    id: 2,
    name: 'James Wilson',
    role: 'Healthcare Volunteer',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    content: 'The training and support provided are exceptional. I\'ve developed medical outreach programs that have served over 1,000 people in rural areas.',
    rating: 5,
    duration: '3 years'
  },
  {
    id: 3,
    name: 'Sophie Martinez',
    role: 'Women Empowerment Lead',
    image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    content: 'Seeing women gain financial independence through our programs is incredibly rewarding. CareSync provides the perfect platform to create real change.',
    rating: 5,
    duration: '1.5 years'
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
          <h2 className="section-header">Volunteer Stories</h2>
          <p className="section-subheader">
            Hear from our dedicated volunteers about their experiences
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
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-lg text-gray-700 italic mb-4">
                    "{testimonials[currentTestimonial].content}"
                  </p>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonials[currentTestimonial].role} • {testimonials[currentTestimonial].duration}
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