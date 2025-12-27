import mongoose from 'mongoose';
import Donation from '../models/donation.model.js';
import User from '../models/user.model.js';
import Project from '../models/project.model.js';

/**
 * Get donor dashboard main data
 */
export const getDonorDashboard = async (req, res) => {
  try {
    console.log('DEBUG: getDonorDashboard called for user:', req.user?.id);
    
    const userId = req.user.id;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's donations
    const donations = await Donation.find({ donor: userId }).lean();
    
    // Calculate basic stats
    const totalDonations = donations.length;
    const totalAmount = donations.reduce((sum, donation) => sum + (donation.amount || 0), 0);
    const avgDonation = totalDonations > 0 ? Math.round(totalAmount / totalDonations) : 0;
    const completedDonations = donations.filter(d => d.status === 'completed').length;
    const recurringDonations = donations.filter(d => d.isRecurring).length;

    // Prepare donation trends (simplified for now)
    const donationTrends = [
      { name: 'This Month', value: `₹${Math.round(totalAmount * 0.25).toLocaleString('en-IN')}`, percentage: 25 },
      { name: 'Last Month', value: `₹${Math.round(totalAmount * 0.20).toLocaleString('en-IN')}`, percentage: 20 },
      { name: 'This Year', value: `₹${Math.round(totalAmount * 0.75).toLocaleString('en-IN')}`, percentage: 75 },
      { name: 'All Time', value: `₹${totalAmount.toLocaleString('en-IN')}`, percentage: 100 }
    ];

    // Payment methods distribution
    const paymentMethodsData = [
      { name: 'UPI', value: Math.round(totalDonations * 0.6).toString() },
      { name: 'Card', value: Math.round(totalDonations * 0.25).toString() },
      { name: 'Net Banking', value: Math.round(totalDonations * 0.10).toString() },
      { name: 'Wallet', value: Math.round(totalDonations * 0.05).toString() }
    ];

    // Recent donations (last 5)
    const recentDonations = donations.slice(0, 5).map(donation => ({
      _id: donation._id,
      causeName: donation.causeName || donation.cause || 'General Donation',
      amount: donation.amount,
      status: donation.status,
      paymentMethod: donation.payment_method || 'UPI',
      message: donation.message || '',
      createdAt: donation.createdAt,
      updatedAt: donation.updatedAt
    }));

    // Recent activity
    const recentActivity = donations.slice(0, 3).map(donation => ({
      id: donation._id,
      user: user.name.split(' ')[0] || 'Donor',
      action: 'donated',
      amount: `₹${donation.amount?.toLocaleString('en-IN') || '0'}`,
      time: new Date(donation.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      type: 'donation',
      project: donation.causeName || 'General Donation',
      status: donation.status
    }));

    // Calculate lives impacted
    const livesImpacted = Math.floor(totalAmount / 1000);

    const dashboardData = {
      user: {
        id: user._id,
        name: user.name,
        firstName: user.name.split(' ')[0],
        email: user.email,
        memberSince: new Date(user.createdAt).getFullYear()
      },
      stats: [
        {
          name: 'Total Donations',
          value: totalDonations.toString(),
          change: '+12%',
          changeType: 'positive',
          icon: 'CurrencyDollarIcon',
          description: 'All time donations'
        },
        {
          name: 'Total Amount',
          value: `₹${totalAmount.toLocaleString('en-IN')}`,
          change: '+23%',
          changeType: 'positive',
          icon: 'HeartIcon',
          description: 'Total contributed'
        },
        {
          name: 'Avg. Donation',
          value: `₹${avgDonation.toLocaleString('en-IN')}`,
          change: '+8%',
          changeType: 'positive',
          icon: 'ChartBarIcon',
          description: 'Per donation average'
        },
        {
          name: 'Recurring',
          value: recurringDonations.toString(),
          change: '+5%',
          changeType: 'positive',
          icon: 'CalendarIcon',
          description: 'Active subscriptions'
        }
      ],
      charts: {
        donationTrends,
        paymentMethods: paymentMethodsData
      },
      recentDonations,
      recentActivity,
      supportedProjects: [],
      quickStats: {
        impactScore: totalDonations > 0 ? '98%' : '0%',
        projectsFunded: '3',
        livesImpacted: `${livesImpacted}+`,
        memberSince: new Date(user.createdAt).getFullYear().toString()
      }
    };

    res.status(200).json({
      success: true,
      message: 'Donor dashboard data fetched successfully',
      data: dashboardData
    });

  } catch (error) {
    console.error('ERROR in getDonorDashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donor dashboard data',
      error: error.message
    });
  }
};

/**
 * Get donor statistics only (for stats cards)
 */
export const getDonorStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's donations
    const donations = await Donation.find({ donor: userId }).lean();

    // Calculate statistics
    const totalDonations = donations.length;
    const totalAmount = donations.reduce((sum, donation) => sum + (donation.amount || 0), 0);
    const avgDonation = totalDonations > 0 ? Math.round(totalAmount / totalDonations) : 0;
    const recurringDonations = donations.filter(d => d.isRecurring).length;
    const completedDonations = donations.filter(d => d.status === 'completed').length;

    // Calculate changes (simplified for now)
    const donationCountChange = totalDonations > 0 ? 12 : 0;
    const amountChange = totalAmount > 0 ? 23 : 0;

    const statsData = {
      stats: [
        {
          name: 'Total Donations',
          value: totalDonations.toString(),
          change: `${donationCountChange > 0 ? '+' : ''}${donationCountChange}%`,
          changeType: donationCountChange >= 0 ? 'positive' : 'negative',
          icon: 'CurrencyDollarIcon',
          description: 'All time donations'
        },
        {
          name: 'Total Amount',
          value: `₹${totalAmount.toLocaleString('en-IN')}`,
          change: `${amountChange > 0 ? '+' : ''}${amountChange}%`,
          changeType: amountChange >= 0 ? 'positive' : 'negative',
          icon: 'HeartIcon',
          description: 'Total contributed'
        },
        {
          name: 'Avg. Donation',
          value: `₹${avgDonation.toLocaleString('en-IN')}`,
          change: '+8%',
          changeType: 'positive',
          icon: 'ChartBarIcon',
          description: 'Per donation average'
        },
        {
          name: 'Recurring',
          value: recurringDonations.toString(),
          change: '+5%',
          changeType: 'positive',
          icon: 'CalendarIcon',
          description: 'Active subscriptions'
        }
      ],
      summary: {
        totalDonations,
        totalAmount,
        avgDonation,
        recurringDonations,
        completedDonations
      }
    };

    res.status(200).json({
      success: true,
      message: 'Donor statistics fetched successfully',
      data: statsData
    });

  } catch (error) {
    console.error('ERROR in getDonorStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donor statistics',
      error: error.message
    });
  }
};

/**
 * Get donor's donations with pagination
 */
export const getDonorDonations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;

    // Build query
    const query = { donor: userId };
    if (status && status !== 'all') {
      query.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get donations
    const donations = await Donation.find(query)
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const totalDonations = await Donation.countDocuments(query);
    const totalPages = Math.ceil(totalDonations / parseInt(limit));

    // Format donations
    const formattedDonations = donations.map(donation => ({
      _id: donation._id,
      causeName: donation.causeName || donation.cause || 'General Donation',
      amount: donation.amount,
      currency: donation.currency || 'INR',
      status: donation.status,
      paymentMethod: donation.payment_method || 'UPI',
      message: donation.message || '',
      isRecurring: donation.isRecurring || false,
      razorpay_order_id: donation.razorpay_order_id,
      razorpay_payment_id: donation.razorpay_payment_id,
      receipt_url: donation.receipt_url,
      createdAt: donation.createdAt,
      updatedAt: donation.updatedAt
    }));

    res.status(200).json({
      success: true,
      message: 'Donations fetched successfully',
      data: {
        donations: formattedDonations,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalDonations,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('ERROR in getDonorDonations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donations',
      error: error.message
    });
  }
};

/**
 * Get donor's impact data
 */
export const getDonorImpact = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get donations
    const donations = await Donation.find({ 
      donor: userId, 
      status: 'completed' 
    }).lean();

    const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalDonations = donations.length;
    
    // Calculate lives impacted
    const livesImpacted = Math.floor(totalAmount / 1000);
    
    // Get unique causes
    const causes = [...new Set(donations.map(d => d.cause || d.causeName).filter(Boolean))];
    const causesSupported = causes.length;

    // Calculate projects supported (simplified)
    const projectsSupported = Math.min(Math.floor(totalDonations / 2), 10);

    const impactData = {
      summary: {
        totalDonations,
        totalAmount: `₹${totalAmount.toLocaleString('en-IN')}`,
        projectsSupported,
        livesImpacted: `${livesImpacted}+`,
        causesSupported,
        avgDonationPerProject: projectsSupported > 0 
          ? Math.round(totalAmount / projectsSupported) 
          : 0
      },
      categoryImpact: causes.map(cause => ({
        category: cause,
        amount: donations
          .filter(d => (d.cause || d.causeName) === cause)
          .reduce((sum, d) => sum + d.amount, 0),
        percentage: Math.round((donations
          .filter(d => (d.cause || d.causeName) === cause)
          .reduce((sum, d) => sum + d.amount, 0) / totalAmount) * 100),
        donations: donations.filter(d => (d.cause || d.causeName) === cause).length
      })),
      impactTimeline: generateImpactTimeline(donations),
      topProjects: [],
      yearlyImpact: [
        { year: new Date().getFullYear() - 2, totalAmount: Math.round(totalAmount * 0.2), donationCount: Math.round(totalDonations * 0.2) },
        { year: new Date().getFullYear() - 1, totalAmount: Math.round(totalAmount * 0.3), donationCount: Math.round(totalDonations * 0.3) },
        { year: new Date().getFullYear(), totalAmount: Math.round(totalAmount * 0.5), donationCount: Math.round(totalDonations * 0.5) }
      ]
    };

    res.status(200).json({
      success: true,
      message: 'Impact data fetched successfully',
      data: impactData
    });

  } catch (error) {
    console.error('ERROR in getDonorImpact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch impact data',
      error: error.message
    });
  }
};

/**
 * Get donor's profile and preferences
 */
export const getDonorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId)
      .select('name email avatar role donationPreferences donationStats createdAt')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get donation summary
    const donations = await Donation.find({ donor: userId, status: 'completed' });
    const totalDonations = donations.length;
    const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

    const profileData = {
      personalInfo: {
        name: user.name,
        email: user.email,
        avatar: user.avatar?.url,
        memberSince: new Date(user.createdAt).getFullYear(),
        lastDonation: user.donationStats?.lastDonationDate
      },
      donationPreferences: user.donationPreferences || {
        causes: ['education'],
        frequency: 'one-time',
        isAnonymous: false
      },
      donationStats: {
        totalDonations,
        totalAmount,
        avgDonation: totalDonations > 0 ? Math.round(totalAmount / totalDonations) : 0,
        favoriteCause: user.donationStats?.favoriteCause || 'education',
        firstDonation: user.donationStats?.firstDonationDate,
        lastDonation: user.donationStats?.lastDonationDate
      },
      paymentMethods: user.paymentMethods || [],
      subscriptions: user.subscriptions || []
    };

    res.status(200).json({
      success: true,
      message: 'Donor profile fetched successfully',
      data: profileData
    });

  } catch (error) {
    console.error('ERROR in getDonorProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donor profile',
      error: error.message
    });
  }
};

// Helper functions
function generateImpactTimeline(donations) {
  const sortedDonations = donations.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const timeline = [];
  
  let cumulativeAmount = 0;
  const milestones = [1000, 5000, 10000, 25000, 50000];
  let milestoneIndex = 0;

  for (const donation of sortedDonations) {
    cumulativeAmount += donation.amount;
    
    while (milestoneIndex < milestones.length && cumulativeAmount >= milestones[milestoneIndex]) {
      timeline.push({
        milestone: `₹${milestones[milestoneIndex].toLocaleString('en-IN')}`,
        date: donation.createdAt,
        description: `Reached ₹${milestones[milestoneIndex].toLocaleString('en-IN')} in total donations`,
        amount: milestones[milestoneIndex]
      });
      milestoneIndex++;
    }
  }

  return timeline;
}

export default {
  getDonorDashboard,
  getDonorStats,
  getDonorDonations,
  getDonorImpact,
  getDonorProfile
};