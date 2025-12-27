import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Donation from '../models/donation.model.js';
import Beneficiary from '../models/beneficiaryApplication.model.js';
import Project from '../models/project.model.js';
import Volunteer from '../models/volunteer.model.js';

/**
 * Admin Dashboard Controller
 */
export const getAdminDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total donors count (users with donations)
    const totalDonors = await Donation.aggregate([
      { $group: { _id: '$donor' } },
      { $count: 'totalDonors' }
    ]);

    // Get donation statistics
    const donationStats = await Donation.aggregate([
      {
        $facet: {
          totalAmount: [
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ],
          paymentMethods: [
            { $group: { _id: '$payment_method', count: { $sum: 1 } } }
          ],
          monthlyTrend: [
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' }
                },
                total: { $sum: '$amount' },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 6 }
          ]
        }
      }
    ]);

    // Get beneficiary applications count
    const beneficiaryStats = await Beneficiary.aggregate([
      { $group: { _id: null, total: { $sum: 1 } } }
    ]);

    // Get active volunteers count
    const volunteerStats = await Volunteer.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: 1 } } }
    ]);

    // Get recent donations
    const recentDonations = await Donation.find({ status: 'completed' })
      .populate('donor', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get recent beneficiary applications
    const recentApplications = await Beneficiary.find()
      .populate('applicantId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get project progress
    const projectProgress = await Project.find({ status: 'active' })
      .select('title targetAmount collectedAmount')
      .lean()
      .then(projects => 
        projects.map(project => ({
          name: project.title,
          progress: project.targetAmount > 0 
            ? Math.round((project.collectedAmount / project.targetAmount) * 100)
            : 0,
          target: project.targetAmount,
          raised: project.collectedAmount,
          percentage: project.targetAmount > 0 
            ? Math.round((project.collectedAmount / project.targetAmount) * 100)
            : 0
        }))
      );

    // Get total projects count
    const projectStats = await Project.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    // Recent activities
    const recentActivities = [
      ...recentDonations.map(donation => ({
        id: donation._id,
        user: donation.donor?.name || 'Anonymous',
        action: 'donated',
        amount: `₹${donation.amount}`,
        time: donation.createdAt,
        type: 'donation',
        project: donation.causeName || 'General Donation'
      })),
      ...recentApplications.map(app => ({
        id: app._id,
        user: app.applicantId?.name || 'Unknown',
        action: 'applied for beneficiary',
        time: app.createdAt,
        type: 'beneficiary',
        project: app.projectTitle
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

    // Process donation stats
    const processedDonationStats = donationStats[0]?.paymentMethods?.map(method => ({
      name: method._id || 'Unknown',
      value: method.count || 0,
      percentage: donationStats[0]?.totalAmount[0]?.total 
        ? Math.round((method.count / donationStats[0].totalAmount[0].total) * 100)
        : 0
    })) || [];

    // Response data
    const dashboardData = {
      statistics: {
        totalDonors: totalDonors[0]?.totalDonors || 0,
        totalDonations: donationStats[0]?.totalAmount[0]?.total || 0,
        totalBeneficiaries: beneficiaryStats[0]?.total || 0,
        activeVolunteers: volunteerStats[0]?.total || 0,
        totalProjects: projectStats[0]?.total || 0,
        activeProjects: projectStats[0]?.active || 0,
        completedProjects: projectStats[0]?.completed || 0
      },
      recentActivities,
      projectProgress: projectProgress.slice(0, 4),
      donationStats: {
        paymentMethods: processedDonationStats,
        monthlyTrend: donationStats[0]?.monthlyTrend || []
      },
      quickStats: {
        successRate: '89%',
        communities: '24',
        countries: '5'
      }
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};

/**
 * Beneficiary Dashboard Controller
 */
export const getBeneficiaryDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's beneficiary applications
    const applications = await Beneficiary.find({ applicantId: userId })
      .populate('projectId', 'title status')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate stats
    const totalApplications = applications.length;
    const approved = applications.filter(app => app.status === 'approved').length;
    const pending = applications.filter(app => app.status === 'pending').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;
    const successRate = totalApplications > 0 ? Math.round((approved / totalApplications) * 100) : 0;

    // Get project progress for approved applications
    const projectProgress = applications
      .filter(app => app.status === 'approved')
      .map(app => {
        const progress = app.applicationDetails?.expectedSupport > 0 
          ? Math.round((app.disbursedAmount / app.applicationDetails.expectedSupport) * 100) || 0
          : 0;
        
        return {
          name: app.projectTitle,
          value: `${progress}%`,
          progress: progress,
          target: `₹${app.applicationDetails?.expectedSupport?.toLocaleString() || '0'}`,
          raised: `₹${app.disbursedAmount?.toLocaleString() || '0'}`,
          percentage: progress
        };
      });

    // Application status distribution
    const statusDistribution = [
      { status: 'Approved', count: approved, percentage: Math.round((approved / totalApplications) * 100) || 0 },
      { status: 'Pending', count: pending, percentage: Math.round((pending / totalApplications) * 100) || 0 },
      { status: 'Rejected', count: rejected, percentage: Math.round((rejected / totalApplications) * 100) || 0 }
    ];

    // Recent activity
    const recentActivity = applications.slice(0, 3).map(app => ({
      id: app._id,
      title: app.projectTitle,
      action: `application ${app.status}`,
      time: app.updatedAt,
      type: app.status,
      amount: app.applicationDetails?.expectedSupport 
        ? `₹${app.applicationDetails.expectedSupport.toLocaleString()}` 
        : null
    }));

    // Recent applications
    const recentApplications = applications.slice(0, 5).map(app => ({
      _id: app._id,
      projectTitle: app.projectTitle,
      status: app.status,
      requestedAmount: app.applicationDetails?.expectedSupport,
      approvedAmount: app.approvedAmount,
      disbursedAmount: app.disbursedAmount,
      reviewNotes: app.reviewNotes,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt
    }));

    const dashboardData = {
      statistics: {
        totalApplications,
        approved,
        pending,
        rejected,
        successRate
      },
      recentApplications,
      projectProgress,
      statusDistribution,
      recentActivity,
      quickStats: {
        successRate: `${successRate}%`,
        avgFunding: '₹25,000',
        responseTime: '3-5 days',
        revisionRate: '12%'
      }
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Error fetching beneficiary dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};

/**
 * Donor Dashboard Controller
 */
export const getDonorDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's donations
    const donations = await Donation.find({ donor: userId })
      .populate('projectId', 'title')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate stats
    const totalDonations = donations.length;
    const totalAmount = donations.reduce((sum, donation) => sum + (donation.amount || 0), 0);
    const avgDonation = totalDonations > 0 ? Math.round(totalAmount / totalDonations) : 0;
    const recurringDonations = donations.filter(d => d.isRecurring).length;
    const completedDonations = donations.filter(d => d.status === 'completed').length;

    // Get payment methods distribution
    const paymentMethods = donations.reduce((acc, donation) => {
      const method = donation.payment_method || 'Unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    const paymentMethodData = Object.entries(paymentMethods).map(([method, count]) => ({
      name: method,
      value: count.toString()
    }));

    // Fill missing payment methods
    const requiredMethods = ['UPI', 'Card', 'Net Banking', 'Wallet'];
    requiredMethods.forEach(method => {
      if (!paymentMethodData.find(pm => pm.name === method)) {
        paymentMethodData.push({ name: method, value: '0' });
      }
    });

    // Donation trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const donationTrends = await Donation.aggregate([
      {
        $match: {
          donor: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: sixMonthsAgo },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    // Format donation trends for chart
    const formattedTrends = donationTrends.map(trend => ({
      name: `${trend._id.year}-${trend._id.month}`,
      value: `₹${trend.total.toLocaleString()}`,
      percentage: Math.round((trend.total / totalAmount) * 100) || 0
    }));

    // Recent donations
    const recentDonations = donations.slice(0, 5).map(donation => ({
      _id: donation._id,
      causeName: donation.causeName,
      amount: donation.amount,
      status: donation.status,
      paymentMethod: donation.payment_method,
      message: donation.message,
      createdAt: donation.createdAt
    }));

    // Recent activity
    const recentActivity = donations.slice(0, 3).map(donation => ({
      id: donation._id,
      user: req.user.name,
      action: 'donated',
      amount: `₹${donation.amount?.toLocaleString()}`,
      time: donation.createdAt,
      type: 'donation',
      project: donation.causeName || 'General Donation'
    }));

    // Get user's donor profile
    const user = await User.findById(userId).select('donationStats donationPreferences');
    
    const dashboardData = {
      statistics: {
        totalDonations,
        totalAmount,
        avgDonation,
        recurringDonations,
        completedDonations,
        impactScore: user?.donationStats?.totalDonations > 0 ? '98%' : '0%',
        livesImpacted: Math.floor(totalAmount / 1000) * 10 || 0
      },
      recentDonations,
      donationTrends: formattedTrends,
      paymentMethods: paymentMethodData.slice(0, 4),
      recentActivity,
      donorProfile: {
        memberSince: req.user.createdAt?.getFullYear() || '2023',
        favoriteCause: user?.donationStats?.favoriteCause || 'education',
        donationFrequency: user?.donationPreferences?.frequency || 'one-time',
        isAnonymous: user?.donationPreferences?.isAnonymous || false
      }
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Error fetching donor dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};

/**
 * Get user-specific statistics
 */
export const getUserStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let statistics = {};

    switch (userRole) {
      case 'admin':
        // Admin stats
        const [
          totalUsers,
          totalProjects,
          totalDonations,
          totalVolunteers
        ] = await Promise.all([
          User.countDocuments(),
          Project.countDocuments(),
          Donation.countDocuments(),
          Volunteer.countDocuments({ status: 'active' })
        ]);

        statistics = {
          totalUsers,
          totalProjects,
          totalDonations,
          totalVolunteers,
          role: 'admin'
        };
        break;

      case 'donor':
        // Donor stats
        const donations = await Donation.find({ donor: userId });
        const totalDonorAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
        
        statistics = {
          totalDonations: donations.length,
          totalAmount: totalDonorAmount,
          lastDonation: donations[0]?.createdAt || null,
          role: 'donor'
        };
        break;

      case 'beneficiary':
        // Beneficiary stats
        const applications = await Beneficiary.find({ applicantId: userId });
        const approvedApplications = applications.filter(app => app.status === 'approved').length;
        
        statistics = {
          totalApplications: applications.length,
          approvedApplications,
          pendingApplications: applications.filter(app => app.status === 'pending').length,
          role: 'beneficiary'
        };
        break;

      default:
        statistics = {
          role: userRole,
          message: 'No specific statistics for this role'
        };
    }

    res.status(200).json({
      success: true,
      data: statistics
    });

  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};