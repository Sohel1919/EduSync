import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  PhotoIcon, 
  CloudArrowUpIcon,
  TrashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const categories = [
  { id: 'education', name: 'Education', color: 'bg-blue-500' },
  { id: 'healthcare', name: 'Healthcare', color: 'bg-green-500' },
  { id: 'women-empowerment', name: 'Women Empowerment', color: 'bg-purple-500' },
  { id: 'environment', name: 'Environment', color: 'bg-teal-500' },
  { id: 'animal-welfare', name: 'Animal Welfare', color: 'bg-orange-500' }
];

const statusOptions = [
  { id: 'draft', name: 'Draft', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'active', name: 'Active', color: 'bg-green-100 text-green-800' },
  { id: 'completed', name: 'Completed', color: 'bg-blue-100 text-blue-800' },
  { id: 'cancelled', name: 'Cancelled', color: 'bg-red-100 text-red-800' }
];

export default function ProjectForm({ project, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    description: '',
    category: 'education',
    targetAmount: '',
    deadline: '',
    images: [],
    tags: [],
    beneficiaries: '',
    organization: '',
    location: '',
    status: 'draft'
  });
  
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        summary: project.summary || '',
        description: project.description || '',
        category: project.category || 'education',
        targetAmount: project.targetAmount || '',
        deadline: project.deadline || '',
        images: project.images || [],
        tags: project.tags || [],
        beneficiaries: project.beneficiaries || '',
        organization: project.organization || '',
        location: project.location || '',
        status: project.status || 'draft'
      });
    }
  }, [project]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Project title is required';
    if (!formData.summary.trim()) newErrors.summary = 'Short summary is required';
    if (!formData.description.trim()) newErrors.description = 'Detailed description is required';
    if (!formData.targetAmount || formData.targetAmount <= 0) newErrors.targetAmount = 'Valid target amount is required';
    if (!formData.deadline) newErrors.deadline = 'Project deadline is required';
    if (!formData.organization.trim()) newErrors.organization = 'Organization name is required';
    if (!formData.location.trim()) newErrors.location = 'Project location is required';
    if (!formData.beneficiaries || formData.beneficiaries <= 0) newErrors.beneficiaries = 'Valid beneficiaries count is required';
    if (formData.images.length === 0) newErrors.images = 'At least one project image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSave({
        ...formData,
        targetAmount: parseInt(formData.targetAmount),
        beneficiaries: parseInt(formData.beneficiaries),
        tags: formData.tags,
        images: formData.images
      });
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Image Upload Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const newImages = Array.from(files).slice(0, 5 - formData.images.length); // Max 5 images
    
    newImages.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, e.target.result]
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Tag Handlers
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {project ? 'Edit Project' : 'Create New Project'}
                </h2>
                <p className="text-primary-100 mt-1">
                  {project ? 'Update project details' : 'Add a new project to the platform'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200"
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-1 h-8 bg-primary-600 rounded-full"></div>
                  <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                        errors.title ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Enter a compelling project title"
                    />
                    {errors.title && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="summary" className="block text-sm font-semibold text-gray-700 mb-2">
                      Short Summary *
                    </label>
                    <textarea
                      id="summary"
                      rows={3}
                      value={formData.summary}
                      onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                        errors.summary ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Brief description that captures the essence of your project"
                    />
                    {errors.summary && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        {errors.summary}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                      Detailed Description *
                    </label>
                    <textarea
                      id="description"
                      rows={5}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                        errors.description ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Provide comprehensive details about the project goals, impact, and implementation plan"
                    />
                    {errors.description && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        {errors.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-1 h-8 bg-secondary-600 rounded-full"></div>
                  <h3 className="text-xl font-semibold text-gray-900">Project Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                          className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                            formData.category === category.id
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                            <span className="font-medium">{category.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    >
                      {statusOptions.map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="targetAmount" className="block text-sm font-semibold text-gray-700 mb-2">
                      Target Amount (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        id="targetAmount"
                        value={formData.targetAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                          errors.targetAmount ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        placeholder="500000"
                        min="0"
                      />
                    </div>
                    {errors.targetAmount && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        {errors.targetAmount}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="deadline" className="block text-sm font-semibold text-gray-700 mb-2">
                      Deadline *
                    </label>
                    <input
                      type="date"
                      id="deadline"
                      value={formData.deadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                        errors.deadline ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    />
                    {errors.deadline && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        {errors.deadline}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="organization" className="block text-sm font-semibold text-gray-700 mb-2">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      id="organization"
                      value={formData.organization}
                      onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                        errors.organization ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Your organization name"
                    />
                    {errors.organization && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        {errors.organization}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                        errors.location ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="City, State"
                    />
                    {errors.location && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        {errors.location}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="beneficiaries" className="block text-sm font-semibold text-gray-700 mb-2">
                      Expected Beneficiaries *
                    </label>
                    <input
                      type="number"
                      id="beneficiaries"
                      value={formData.beneficiaries}
                      onChange={(e) => setFormData(prev => ({ ...prev, beneficiaries: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                        errors.beneficiaries ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="250"
                      min="0"
                    />
                    {errors.beneficiaries && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        {errors.beneficiaries}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Images Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-1 h-8 bg-green-500 rounded-full"></div>
                  <h3 className="text-xl font-semibold text-gray-900">Project Images</h3>
                </div>

                <div
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
                    dragActive 
                      ? 'border-primary-500 bg-primary-25' 
                      : errors.images 
                        ? 'border-red-500 bg-red-25' 
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <CloudArrowUpIcon className={`mx-auto h-12 w-12 mb-4 ${
                    dragActive ? 'text-primary-500' : 'text-gray-400'
                  }`} />
                  
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-gray-700">
                      {dragActive ? 'Drop images here' : 'Upload project images'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Drag & drop images or click to browse. Max 5 images.
                    </p>
                    <p className="text-xs text-gray-400">
                      Recommended: 1200×800px or larger
                    </p>
                  </div>
                </div>

                {errors.images && (
                  <p className="text-sm text-red-600 flex items-center">
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    {errors.images}
                  </p>
                )}

                {/* Image Previews */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Project preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-1 h-8 bg-purple-500 rounded-full"></div>
                  <h3 className="text-xl font-semibold text-gray-900">Project Tags</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Add relevant tags (education, rural, healthcare...)"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
                    >
                      Add
                    </button>
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-2 rounded-lg bg-primary-100 text-primary-700 text-sm font-medium"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 hover:text-primary-900 transition-colors"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 transition-all duration-200 font-semibold shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5" />
                      <span>{project ? 'Update Project' : 'Create Project'}</span>
                    </div>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}