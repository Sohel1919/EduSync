import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import ProjectForm from './components/ProjectForm';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';

export default function AddProject() {
  const navigate = useNavigate();
  const api = useApi();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveProject = async (projectData) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call
      // const response = await api.post('/admin/projects', {
      //   ...projectData,
      //   createdBy: user.email
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate back to projects list
      navigate('/admin/projects');
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/admin/projects')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Projects
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Create New Project
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Add a new project to showcase on the platform. Fill in all the required details to get started.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Project Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ProjectForm
            onSave={handleSaveProject}
            onClose={() => navigate('/admin/projects')}
          />
        </motion.div>
      </div>
    </div>
  );
}