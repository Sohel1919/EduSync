import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
} from '@heroicons/react/24/outline';

const categories = [
  { value: 'education', label: 'Education' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'empowerment', label: 'Empowerment' },
  { value: 'environment', label: 'Environment' },
  { value: 'disaster-relief', label: 'Disaster Relief' },
  { value: 'animal-welfare', label: 'Animal Welfare' },
  { value: 'elderly-care', label: 'Elderly Care' },
  { value: 'child-development', label: 'Child Development' }
];

const initialFormData = {
  title: '',
  summary: '',
  description: '',
  category: 'education',
  targetAmount: '',
  deadline: '',
  beneficiaries: '',
  organization: '',
  location: '',
  tags: []
};

export default function VolunteerProjectForm({ onSave, onClose }) {
  const [formData, setFormData] = useState(initialFormData);
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Project title is required';
    if (!formData.summary.trim()) newErrors.summary = 'Short summary is required';
    if (!formData.description.trim()) newErrors.description = 'Detailed description is required';
    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) 
      newErrors.targetAmount = 'Valid target amount is required';
    if (!formData.deadline) newErrors.deadline = 'Project deadline is required';
    if (!formData.beneficiaries || parseInt(formData.beneficiaries) <= 0)
      newErrors.beneficiaries = 'Valid number of beneficiaries is required';
    if (!formData.organization.trim()) newErrors.organization = 'Organization name is required';
    if (!formData.location.trim()) newErrors.location = 'Project location is required';

    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate <= today) {
        newErrors.deadline = 'Deadline must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Prepare data for submission
      const submitData = {
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        description: formData.description.trim(),
        category: formData.category,
        targetAmount: parseFloat(formData.targetAmount),
        beneficiaries: parseInt(formData.beneficiaries),
        deadline: new Date(formData.deadline).toISOString(),
        organization: formData.organization.trim(),
        location: formData.location.trim(),
        tags: formData.tags
      };

      await onSave(submitData);
      
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Enter project title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Summary *
                </label>
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.summary ? 'border-red-500' : 'border-gray-300'
                  } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Brief description of the project"
                />
                {errors.summary && (
                  <p className="mt-1 text-sm text-red-600">{errors.summary}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  rows={5}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Comprehensive project description"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Amount (₹) *
                  </label>
                  <input
                    type="number"
                    name="targetAmount"
                    value={formData.targetAmount}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.targetAmount ? 'border-red-500' : 'border-gray-300'
                    } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="50000"
                    min="1"
                  />
                  {errors.targetAmount && (
                    <p className="mt-1 text-sm text-red-600">{errors.targetAmount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.deadline ? 'border-red-500' : 'border-gray-300'
                    } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.deadline && (
                    <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beneficiaries *
                  </label>
                  <input
                    type="number"
                    name="beneficiaries"
                    value={formData.beneficiaries}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.beneficiaries ? 'border-red-500' : 'border-gray-300'
                    } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="250"
                    min="1"
                  />
                  {errors.beneficiaries && (
                    <p className="mt-1 text-sm text-red-600">{errors.beneficiaries}</p>
                  )}
                </div>
              </div>

              {/* Organization Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.organization ? 'border-red-500' : 'border-gray-300'
                    } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="Enter organization name"
                  />
                  {errors.organization && (
                    <p className="mt-1 text-sm text-red-600">{errors.organization}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="Enter project location"
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Project Tags
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isSubmitting}
                        placeholder="Add a tag"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addTag}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            disabled={isSubmitting}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end items-center p-6 border-t border-gray-200 bg-gray-50 space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}