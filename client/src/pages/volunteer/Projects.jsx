import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/outline';
import { showToast } from '../../utils/toast';
import VolunteerProjectsHeader from './components/VolunteerProjectsHeader';
import VolunteerStatsCards from './components/VolunteerStatsCards';
import VolunteerProjectsFilters from './components/VolunteerProjectsFilters';
import VolunteerProjectsTable from './components/VolunteerProjectsTable';
import VolunteerProjectDetailsModal from './components/VolunteerProjectDetailsModal';
import VolunteerProjectForm from './components/VolunteerProjectForm';
import { projectRequestsAPI } from '../../services/apiService';

export default function VolunteerProjects() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectForm, setShowProjectForm] = useState(false);

  // Fetch volunteer projects from backend
  const fetchProjects = async () => {
    try {
      setLoading(true);
      console.log('Fetching volunteer projects...');
      
      // Try multiple approaches to get user's projects
      let response;
      
      try {
        // First try the user-specific endpoint
        response = await projectRequestsAPI.getMyProjects();
        console.log('Using getMyProjects endpoint');
      } catch (endpointError) {
        console.log('getMyProjects failed, falling back to getAll with filtering');
        // Fallback: get all projects and filter client-side
        response = await projectRequestsAPI.getAll();
        
        if (response.data.success) {
          // Filter to show only approved projects and user's own projects
          const allProjects = response.data.data || [];
          const userProjects = allProjects.filter(project => 
            project.isApproved === 'approved' || 
            (project.createdBy && project.createdBy._id === getCurrentUserId())
          );
          response.data.data = userProjects;
        }
      }
      
      console.log('Projects API Response:', response);
      
      if (response.data.success) {
        const projectsData = response.data.data || [];
        console.log('Raw projects data:', projectsData);
        
        // Transform API data to match component structure
        const transformedProjects = projectsData.map(project => ({
          _id: project._id,
          title: project.title,
          summary: project.summary,
          description: project.description,
          organization: project.organization,
          location: project.location,
          category: project.category,
          targetAmount: project.targetAmount,
          collectedAmount: project.currentAmount || 0,
          beneficiaries: project.beneficiaries,
          deadline: project.deadline,
          createdAt: project.createdAt,
          volunteerStatus: mapApprovalStatus(project.isApproved),
          priority: calculatePriority(project.deadline, project.targetAmount, project.currentAmount),
          images: project.projectImage ? [project.projectImage.url] : [],
          tags: project.tags || [],
          progress: project.progress || 0,
          donors: project.donors || 0,
          isApproved: project.isApproved,
          projectImage: project.projectImage,
          rejectionReason: project.rejectionReason,
          createdBy: project.createdBy
        }));
        
        console.log('Transformed projects:', transformedProjects);
        setProjects(transformedProjects);
        setFilteredProjects(transformedProjects);
      } else {
        console.error('API returned success: false', response.data);
        showToast.error(response.data.message || 'Failed to load projects');
        setProjects([]);
        setFilteredProjects([]);
      }
      
    } catch (error) {
      console.error('Error fetching volunteer projects:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error('Server error details:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        showToast.error(error.response.data?.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        showToast.error('Network error: Unable to connect to server');
      } else {
        console.error('Error setting up request:', error.message);
        showToast.error('Failed to load projects');
      }
      
      setProjects([]);
      setFilteredProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get current user ID (you might need to adjust this based on your auth context)
  const getCurrentUserId = () => {
    // This depends on how you store user info
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user._id || user.id;
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    return null;
  };

  // Map backend approval status to volunteer status
  const mapApprovalStatus = (isApproved) => {
    switch (isApproved) {
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      case 'pending':
        return 'pending';
      default:
        return 'pending';
    }
  };

  // Calculate priority based on deadline and funding
  const calculatePriority = (deadline, targetAmount, currentAmount) => {
    try {
      const daysRemaining = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
      const fundingProgress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
      
      if (daysRemaining < 7 || fundingProgress < 30) return 'high';
      if (daysRemaining < 30 || fundingProgress < 60) return 'medium';
      return 'low';
    } catch (error) {
      console.error('Error calculating priority:', error);
      return 'medium';
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter and search projects
  useEffect(() => {
    if (!Array.isArray(projects)) {
      setFilteredProjects([]);
      return;
    }

    let filtered = projects.filter(project => {
      if (!project || typeof project !== 'object') return false;

      const searchLower = searchTerm.toLowerCase();
      const title = String(project.title || '');
      const organization = String(project.organization || '');
      const location = String(project.location || '');
      
      const matchesSearch = 
        title.toLowerCase().includes(searchLower) ||
        organization.toLowerCase().includes(searchLower) ||
        location.toLowerCase().includes(searchLower);
      
      const matchesStatus = statusFilter === 'all' || project.volunteerStatus === statusFilter;
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Sort projects
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        filtered.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
        break;
      case 'deadline':
        filtered.sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0));
        break;
      default:
        break;
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, statusFilter, priorityFilter, sortBy]);

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setShowProjectForm(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await projectRequestsAPI.delete(projectId);
      
      if (response.data.success) {
        showToast.success('Project deleted successfully');
        fetchProjects(); // Refresh the list
      } else {
        showToast.error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      showToast.error('Failed to delete project');
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      // The VolunteerProjectForm already handles API calls
      // Just refresh the projects list after creation
      fetchProjects();
      setShowProjectForm(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error in project creation callback:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <VolunteerProjectsHeader 
          onCreateProject={() => setShowProjectForm(true)}
        />

        {/* Stats Cards */}
        <VolunteerStatsCards projects={projects} />

        {/* Filters and Search Bar */}
        <VolunteerProjectsFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />

        {/* Projects Table */}
        <VolunteerProjectsTable
          projects={filteredProjects}
          loading={loading}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          onViewProject={setSelectedProject}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
        />

        {/* Project Details Modal */}
        {selectedProject && (
          <VolunteerProjectDetailsModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onEdit={() => {
              handleEditProject(selectedProject);
              setSelectedProject(null);
            }}
            onDelete={() => {
              handleDeleteProject(selectedProject._id);
              setSelectedProject(null);
            }}
          />
        )}

        {/* Create/Edit Project Form Modal */}
        {showProjectForm && (
          <VolunteerProjectForm
            project={selectedProject}
            onSave={handleCreateProject}
            onClose={() => {
              setShowProjectForm(false);
              setSelectedProject(null);
            }}
            refreshProjects={fetchProjects}
          />
        )}
      </div>
    </div>
  );
}