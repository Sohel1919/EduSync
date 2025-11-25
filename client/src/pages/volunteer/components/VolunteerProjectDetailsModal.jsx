import { UsersIcon, MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';

export default function VolunteerProjectDetailsModal({ project, onClose, onStatusUpdate }) {
  const progress = Math.round(((project.collectedAmount || 0) / (project.targetAmount || 1)) * 100);
  
  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Project Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h3>
                <p className="text-gray-600">{project.summary}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Project Description</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{project.description}</p>
              </div>

              {/* Progress */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Funding Progress</span>
                  <span className="text-sm text-gray-500">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>₹{(project.collectedAmount || 0).toLocaleString()} raised</span>
                  <span>₹{(project.targetAmount || 0).toLocaleString()} goal</span>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Project Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Organization:</span>
                    <span className="text-sm font-medium">{project.organization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Location:</span>
                    <span className="text-sm font-medium">{project.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Beneficiaries:</span>
                    <span className="text-sm font-medium">{project.beneficiaries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Category:</span>
                    <span className="text-sm font-medium capitalize">{project.category}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Timeline</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Created:</span>
                    <span className="text-sm font-medium">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Deadline:</span>
                    <span className="text-sm font-medium">
                      {new Date(project.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Days Remaining:</span>
                    <span className={`text-sm font-medium ${
                      getDaysRemaining(project.deadline) < 7 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {getDaysRemaining(project.deadline)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              {project.volunteerStatus === 'pending' && (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      onStatusUpdate(project._id || project.id, 'approved');
                      onClose();
                    }}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    Approve Project
                  </button>
                  <button
                    onClick={() => {
                      onStatusUpdate(project._id || project.id, 'rejected');
                      onClose();
                    }}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    Reject Project
                  </button>
                </div>
              )}

              {project.volunteerStatus === 'approved' && (
                <button
                  onClick={() => {
                    onStatusUpdate(project._id || project.id, 'completed');
                    onClose();
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}