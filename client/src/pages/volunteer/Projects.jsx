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

// Dummy data for demonstration
const dummyProjects = [
  {
    _id: '1',
    title: 'Community Education Drive',
    summary: 'Providing free education to underprivileged children in rural areas',
    description: 'A comprehensive education program aimed at providing quality education to children in remote villages. We focus on basic literacy, numeracy, and life skills.',
    organization: 'Education for All Foundation',
    location: 'Rural Maharashtra',
    category: 'education',
    targetAmount: 500000,
    collectedAmount: 350000,
    beneficiaries: 250,
    deadline: '2024-06-30',
    createdAt: '2024-01-15',
    volunteerStatus: 'approved',
    priority: 'high',
    images: [],
    tags: ['education', 'children', 'rural']
  },
  {
    _id: '2',
    title: 'Health Camp Initiative',
    summary: 'Free medical checkups and healthcare services in urban slums',
    description: 'Organizing regular health camps in urban slum areas to provide basic healthcare services, medicines, and health awareness programs.',
    organization: 'Health First NGO',
    location: 'Mumbai Slums',
    category: 'healthcare',
    targetAmount: 300000,
    collectedAmount: 180000,
    beneficiaries: 500,
    deadline: '2024-05-15',
    createdAt: '2024-02-01',
    volunteerStatus: 'pending',
    priority: 'medium',
    images: [],
    tags: ['healthcare', 'medical', 'slums']
  },
  {
    _id: '3',
    title: 'Environmental Cleanup Drive',
    summary: 'Beach and river cleanup with community participation',
    description: 'Weekly cleanup drives at popular beaches and riverbanks, involving local communities and creating awareness about environmental conservation.',
    organization: 'Green Earth Society',
    location: 'Goa Beaches',
    category: 'environment',
    targetAmount: 200000,
    collectedAmount: 120000,
    beneficiaries: 1000,
    deadline: '2024-04-20',
    createdAt: '2024-01-20',
    volunteerStatus: 'completed',
    priority: 'low',
    images: [],
    tags: ['environment', 'cleanup', 'beach']
  },
  {
    _id: '4',
    title: 'Women Empowerment Program',
    summary: 'Skill development and entrepreneurship training for women',
    description: 'Providing vocational training and entrepreneurship skills to underprivileged women to help them become financially independent.',
    organization: 'Women Empowerment Trust',
    location: 'Delhi NCR',
    category: 'empowerment',
    targetAmount: 400000,
    collectedAmount: 250000,
    beneficiaries: 150,
    deadline: '2024-07-31',
    createdAt: '2024-02-10',
    volunteerStatus: 'approved',
    priority: 'high',
    images: [],
    tags: ['women', 'empowerment', 'skills']
  },
  {
    _id: '5',
    title: 'Disaster Relief Operation',
    summary: 'Emergency relief for flood-affected families',
    description: 'Providing immediate relief including food, shelter, and medical aid to families affected by recent floods in the region.',
    organization: 'Disaster Response Team',
    location: 'Flood-affected Areas',
    category: 'disaster-relief',
    targetAmount: 600000,
    collectedAmount: 450000,
    beneficiaries: 300,
    deadline: '2024-03-31',
    createdAt: '2024-01-05',
    volunteerStatus: 'rejected',
    priority: 'high',
    images: [],
    tags: ['disaster', 'relief', 'emergency']
  }
];

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

  // Fetch volunteer projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Simulate API call with dummy data
      setTimeout(() => {
        setProjects(dummyProjects);
        setFilteredProjects(dummyProjects);
        setLoading(false);
      }, 1000);
      
      // Actual API call would be:
      // const response = await projectsAPI.getVolunteerProjects();
      // setProjects(response.data);
      // setFilteredProjects(response.data);
      
    } catch (error) {
      console.error('Error fetching volunteer projects:', error);
      showToast.error('Failed to load projects');
      setProjects([]);
      setFilteredProjects([]);
      setLoading(false);
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

  const handleStatusUpdate = async (projectId, newStatus) => {
    try {
      // Simulate API call
      setProjects(prev => prev.map(project => 
        project._id === projectId 
          ? { ...project, volunteerStatus: newStatus }
          : project
      ));
      
      showToast.success(`Project ${newStatus} successfully`);
      
      // Actual API call would be:
      // await projectsAPI.updateVolunteerStatus(projectId, { status: newStatus });
      // fetchProjects();
      
    } catch (error) {
      console.error('Error updating project status:', error);
      showToast.error('Failed to update project status');
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      // Simulate API call
      const newProject = {
        _id: Date.now().toString(),
        ...projectData,
        volunteerStatus: 'pending',
        createdAt: new Date().toISOString(),
        collectedAmount: 0
      };
      
      setProjects(prev => [newProject, ...prev]);
      setShowProjectForm(false);
      showToast.success('Project created successfully!');
      
      // Actual API call would be:
      // await projectsAPI.createVolunteerProject(projectData);
      // fetchProjects();
      // setShowProjectForm(false);
      
    } catch (error) {
      console.error('Error creating project:', error);
      showToast.error('Failed to create project');
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
          onStatusUpdate={handleStatusUpdate}
        />

        {/* Project Details Modal */}
        {selectedProject && (
          <VolunteerProjectDetailsModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onStatusUpdate={handleStatusUpdate}
          />
        )}

        {/* Create Project Form Modal */}
        {showProjectForm && (
          <VolunteerProjectForm
            onSave={handleCreateProject}
            onClose={() => setShowProjectForm(false)}
          />
        )}
      </div>
    </div>
  );
}