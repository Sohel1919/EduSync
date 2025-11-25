import { PlusIcon } from '@heroicons/react/24/outline';

export default function VolunteerProjectsHeader({ onCreateProject }) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
        <p className="text-gray-600 mt-2">Manage and track your volunteer projects</p>
      </div>
      <button
        onClick={onCreateProject}
        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        Create Project
      </button>
    </div>
  );
}