import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import ProjectForm from './components/ProjectForm';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';

export default function EditProject() {
  const navigate = useNavigate();
  const { id } = useParams();
  const api = useApi();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      // Simulate API call - replace with actual API
      setTimeout(() => {
        const demoProject = {
          id: parseInt(id),
          title: "Education for Underprivileged Children",
          summary: "Providing quality education, books, and school supplies to children from low-income families in rural areas.",
          description: "This project aims to bridge the educational gap by providing comprehensive support including tuition, study materials, and digital literacy programs to underprivileged children in rural Maharashtra.",
          category: "education",
          targetAmount: 500000,
          collectedAmount: 325000,
          deadline: "2024-12-31",
          images: ["https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"],
          tags: ["education", "children", "rural", "school"],
          beneficiaries: 250,
          organization: "Education for All Foundation",
          location: "Rural Maharashtra",
          status: "active",
          createdBy: "admin@caresync.org",
          createdAt: "2024-01-15",
          updates: [
            {
              date: "2024-02-01",
              title: "Project Launch",
              description: "Successfully launched the project with initial funding"
            }
          ]
        };
        setProject(demoProject);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching project:', error);
      setLoading(false);
    }
  };

  const handleSaveProject = async (projectData) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call
      // const response = await api.put(`/admin/projects/${id}`, {
      //   ...projectData,
      //   updatedBy: user.email
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate back to projects list
      navigate('/admin/projects');
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-32 bg-gray-200 rounded mb-8"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

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
                Edit Project
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Update the project details and make changes as needed.
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
            project={project}
            onSave={handleSaveProject}
            onClose={() => navigate('/admin/projects')}
          />
        </motion.div>
      </div>
    </div>
  );
}