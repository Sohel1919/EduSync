import Beneficiary from '../models/beneficiaryApplication.model.js';
import Project from '../models/project.model.js';
import User from '../models/user.model.js';

// Get beneficiary dashboard data
export const getBeneficiaryDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all applications for this beneficiary
    const applications = await Beneficiary.find({ applicantId: userId })
      .populate('projectId', 'title category collectedAmount targetAmount deadline')
      .sort({ createdAt: -1 });

    // Calculate dashboard statistics
    const totalApplications = applications.length;
    const approvedApplications = applications.filter(app => app.status === 'approved').length;
    const pendingApplications = applications.filter(app => app.status === 'pending' || app.status === 'under-review').length;
    const rejectedApplications = applications.filter(app => app.status === 'rejected').length;
    
    // Calculate success rate
    const successRate = totalApplications > 0 
      ? Math.round((approvedApplications / totalApplications) * 100) 
      : 0;

    // Calculate funding progress for approved applications
    const fundingProgress = applications
      .filter(app => app.status === 'approved')
      .map(app => {
        const project = app.projectId;
        const progress = project && project.targetAmount > 0 
          ? Math.round((project.collectedAmount / project.targetAmount) * 100)
          : 0;
        
        return {
          name: app.projectTitle,
          value: `${progress}%`,
          progress: progress,
          target: project ? `₹${project.targetAmount.toLocaleString()}` : '₹0',
          raised: project ? `₹${project.collectedAmount.toLocaleString()}` : '₹0',
          percentage: progress
        };
      })
      .slice(0, 4); // Limit to 4 projects

    // Prepare application status data for pie chart
    const applicationStatus = [
      { name: 'Approved', value: approvedApplications },
      { name: 'Pending', value: pendingApplications },
      { name: 'Rejected', value: rejectedApplications }
    ];

    // Prepare recent activity
    const recentActivity = applications
      .slice(0, 3)
      .map(app => ({
        id: app._id,
        user: `${app.personalInfo?.firstName || ''} ${app.personalInfo?.lastName || ''}`,
        action: `application ${app.status}`,
        amount: app.applicationDetails?.expectedSupport ? `₹${app.applicationDetails.expectedSupport.toLocaleString()}` : null,
        time: app.updatedAt.toLocaleDateString(),
        type: app.status,
        project: app.projectTitle
      }));

    // Prepare stats cards data
    const stats = [
      {
        name: 'Total Applications',
        value: totalApplications.toString(),
        change: totalApplications > 0 ? '+8%' : '+0%',
        changeType: totalApplications > 0 ? 'positive' : 'neutral',
        description: 'Applications submitted'
      },
      {
        name: 'Approved Projects',
        value: approvedApplications.toString(),
        change: approvedApplications > 0 ? '+15%' : '+0%',
        changeType: approvedApplications > 0 ? 'positive' : 'neutral',
        description: 'Successfully funded'
      },
      {
        name: 'Pending Review',
        value: pendingApplications.toString(),
        change: pendingApplications > 0 ? 'In review' : 'No pending',
        changeType: pendingApplications > 0 ? 'positive' : 'neutral',
        description: 'Awaiting approval'
      },
      {
        name: 'Rejected Applications',
        value: rejectedApplications.toString(),
        change: rejectedApplications > 0 ? '-5%' : '+0%',
        changeType: rejectedApplications > 0 ? 'negative' : 'neutral',
        description: 'Requires revision'
      }
    ];

    // Quick stats
    const quickStats = [
      { name: 'Success Rate', value: `${successRate}%` },
      { name: 'Avg. Funding', value: calculateAverageFunding(applications) },
      { name: 'Response Time', value: '3-5 days' },
      { name: 'Revision Rate', value: '12%' }
    ];

    // Recent applications (for the table)
    const recentApplications = applications.slice(0, 5).map(app => ({
      _id: app._id,
      projectTitle: app.projectTitle,
      category: app.projectId?.category || 'N/A',
      status: app.status,
      requestedAmount: app.applicationDetails?.expectedSupport || 0,
      approvedAmount: app.applicationDetails?.approvedAmount || 0,
      reviewNotes: app.reviewNotes,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      projectDuration: 'N/A', // You might want to add this field to your model
      beneficiaryCount: app.projectId?.beneficiaries || 'N/A'
    }));

    res.status(200).json({
      success: true,
      data: {
        stats,
        applications: recentApplications,
        projectProgress: fundingProgress,
        applicationStatus,
        recentActivity,
        quickStats,
        totalApplications,
        approvedApplications,
        pendingApplications,
        rejectedApplications,
        successRate
      }
    });

  } catch (error) {
    console.error('Error fetching beneficiary dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Helper function to calculate average funding
const calculateAverageFunding = (applications) => {
  const approvedApps = applications.filter(app => app.status === 'approved');
  if (approvedApps.length === 0) return '₹0';
  
  const total = approvedApps.reduce((sum, app) => {
    return sum + (app.applicationDetails?.expectedSupport || 0);
  }, 0);
  
  const average = Math.round(total / approvedApps.length);
  return `₹${average.toLocaleString()}`;
};

// Get beneficiary stats only (for quick loading)
export const getBeneficiaryStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const applications = await Beneficiary.find({ applicantId: userId });
    
    const totalApplications = applications.length;
    const approvedApplications = applications.filter(app => app.status === 'approved').length;
    const pendingApplications = applications.filter(app => app.status === 'pending' || app.status === 'under-review').length;
    const rejectedApplications = applications.filter(app => app.status === 'rejected').length;
    const successRate = totalApplications > 0 
      ? Math.round((approvedApplications / totalApplications) * 100) 
      : 0;

    const stats = [
      {
        name: 'Total Applications',
        value: totalApplications.toString(),
        change: totalApplications > 0 ? '+8%' : '+0%',
        changeType: totalApplications > 0 ? 'positive' : 'neutral',
        description: 'Applications submitted',
        icon: 'DocumentTextIcon'
      },
      {
        name: 'Approved Projects',
        value: approvedApplications.toString(),
        change: approvedApplications > 0 ? '+15%' : '+0%',
        changeType: approvedApplications > 0 ? 'positive' : 'neutral',
        description: 'Successfully funded',
        icon: 'CheckCircleIcon'
      },
      {
        name: 'Pending Review',
        value: pendingApplications.toString(),
        change: pendingApplications > 0 ? 'In review' : 'No pending',
        changeType: pendingApplications > 0 ? 'positive' : 'neutral',
        description: 'Awaiting approval',
        icon: 'ClockIcon'
      },
      {
        name: 'Rejected Applications',
        value: rejectedApplications.toString(),
        change: rejectedApplications > 0 ? '-5%' : '+0%',
        changeType: rejectedApplications > 0 ? 'negative' : 'neutral',
        description: 'Requires revision',
        icon: 'XCircleIcon'
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        stats,
        totalApplications,
        approvedApplications,
        pendingApplications,
        rejectedApplications,
        successRate
      }
    });

  } catch (error) {
    console.error('Error fetching beneficiary stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get beneficiary's projects with filtering
export const getBeneficiaryProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, search, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = { applicantId: userId };
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { projectTitle: { $regex: search, $options: 'i' } },
        { 'projectId.category': { $regex: search, $options: 'i' } },
        { 'projectId.title': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const applications = await Beneficiary.find(filter)
      .populate('projectId', 'title category collectedAmount targetAmount deadline')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Beneficiary.countDocuments(filter);

    // Format applications for response
    const formattedApplications = applications.map(app => ({
      _id: app._id,
      projectTitle: app.projectTitle,
      category: app.projectId?.category || 'N/A',
      status: app.status,
      requestedAmount: app.applicationDetails?.expectedSupport || 0,
      approvedAmount: app.applicationDetails?.approvedAmount || 0,
      reviewNotes: app.reviewNotes,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      projectDuration: 'N/A',
      beneficiaryCount: app.projectId?.beneficiaries || 'N/A',
      projectDescription: app.projectId?.description || 'No description',
      disbursedAmount: app.applicationDetails?.disbursedAmount || 0,
      nextSteps: app.applicationDetails?.nextSteps || null
    }));

    // Calculate stats for the filtered results
    const totalApplications = total;
    const approved = applications.filter(app => app.status === 'approved').length;
    const pending = applications.filter(app => app.status === 'pending' || app.status === 'under-review').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;

    const stats = [
      {
        name: 'Total Applications',
        value: totalApplications.toString(),
        change: '+8%',
        description: 'All submitted applications',
        icon: 'DocumentTextIcon',
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        name: 'Approved',
        value: approved.toString(),
        change: '+15%',
        description: 'Successfully funded projects',
        icon: 'CheckCircleIcon',
        color: 'from-green-500 to-emerald-600',
        bgColor: 'bg-green-50'
      },
      {
        name: 'Pending',
        value: pending.toString(),
        change: pending > 0 ? 'In review' : 'No pending',
        description: 'Awaiting approval',
        icon: 'ClockIcon',
        color: 'from-amber-500 to-amber-600',
        bgColor: 'bg-amber-50'
      },
      {
        name: 'Rejected',
        value: rejected.toString(),
        change: '-5%',
        description: 'Requires revision',
        icon: 'XCircleIcon',
        color: 'from-red-500 to-red-600',
        bgColor: 'bg-red-50'
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        applications: formattedApplications,
        stats,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching beneficiary projects:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export default {
  getBeneficiaryDashboard,
  getBeneficiaryStats,
  getBeneficiaryProjects
};