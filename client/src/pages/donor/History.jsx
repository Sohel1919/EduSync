import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  EyeIcon,
  ReceiptRefundIcon,
  ArrowDownTrayIcon as DownloadIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { donationsAPI } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

// StatsCard Component
const StatsCard = ({ stat, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300"
  >
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{stat.name}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          <div className={`flex items-center mt-1 text-sm font-semibold ${
            stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
          }`}>
            {stat.changeType === 'positive' ? (
              <ArrowTrendingUpIcon className="h-4 w-4" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4" />
            )}
            <span className="ml-1">{stat.change}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
        </div>
        <div className={`p-3 rounded-xl ${stat.bgColor}`}>
          <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} text-white`}>
            <stat.icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const DonationTable = ({ donations, loading, onViewReceipt, onDownloadReceipt }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg p-4">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <CurrencyDollarIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-500">No donation history found</p>
        <p className="text-sm text-gray-400 mt-1">Make your first donation to see it here</p>
        <button
          onClick={() => window.location.href = '/donate'}
          className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Make a Donation
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-primary-50 to-primary-100/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Project / Cause
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Amount
              </th>
              <th className="px6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Payment Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {donations.map((donation) => (
              <tr key={donation._id} className="hover:bg-primary-50/30 transition-colors duration-150">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-3 ${
                      donation.status === 'completed' ? 'bg-green-100' :
                      donation.status === 'pending' ? 'bg-yellow-100' :
                      'bg-red-100'
                    }`}>
                      <CurrencyDollarIcon className={`h-5 w-5 ${
                        donation.status === 'completed' ? 'text-green-600' :
                        donation.status === 'pending' ? 'text-yellow-600' :
                        'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{donation.causeName || donation.project?.title || 'General Donation'}</div>
                      <div className="text-sm text-gray-500">
                        {donation.project?.organization || 'Hope Bridge Foundation'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-green-600">₹{donation.amount?.toLocaleString('en-IN') || '0'}</div>
                  {donation.isRecurring && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                      Recurring
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    donation.status === 'completed' ? 'bg-green-100 text-green-800' :
                    donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {donation.status?.charAt(0).toUpperCase() + donation.status?.slice(1) || 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {new Date(donation.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(donation.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{donation.paymentMethod || 'UPI'}</div>
                  {donation.razorpay_payment_id && (
                    <div className="text-xs text-gray-500 truncate max-w-[120px]">
                      ID: {donation.razorpay_payment_id.substring(0, 8)}...
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onViewReceipt(donation)}
                      className="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                      title="View Receipt"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDownloadReceipt(donation)}
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Download Receipt"
                    >
                      <DownloadIcon className="h-5 w-5" />
                    </motion.button>
                    {donation.receipt_url && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => window.open(donation.receipt_url, '_blank')}
                        className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title="View Receipt PDF"
                      >
                        <DocumentTextIcon className="h-5 w-5" />
                      </motion.button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ReceiptModal = ({ donation, isOpen, onClose }) => {
  if (!isOpen || !donation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Donation Receipt</h2>
              <p className="text-sm text-gray-500 mt-1">
                Transaction ID: {donation.razorpay_order_id || donation._id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          <div className="border-2 border-primary-200 rounded-lg p-6 mb-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-primary-600">HOPE BRIDGE FOUNDATION</h3>
              <p className="text-gray-600">Tax Exempt Charity Organization</p>
              <p className="text-sm text-gray-500 mt-1">Registered under Section 12A & 80G of Income Tax Act</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-2 text-primary-600" />
                  Donor Information
                </h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Name: {donation.donor_info?.name || 'Anonymous Donor'}</p>
                  <p className="text-sm text-gray-600">Email: {donation.donor_info?.email || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Phone: {donation.donor_info?.phone || 'N/A'}</p>
                  <p className="text-sm text-gray-600">
                    Anonymity: {donation.donor_info?.isAnonymous ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <BanknotesIcon className="h-5 w-5 mr-2 text-primary-600" />
                  Transaction Details
                </h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Date: {new Date(donation.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    Time: {new Date(donation.createdAt).toLocaleTimeString('en-IN')}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    Status: {donation.status}
                  </p>
                  <p className="text-sm text-gray-600">
                    Method: {donation.paymentMethod || 'UPI'}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-b py-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-900">{donation.causeName || donation.project?.title || 'General Donation'}</h4>
                  <p className="text-sm text-gray-600">
                    {donation.project?.description || 'Charitable Donation towards social welfare'}
                  </p>
                  {donation.message && (
                    <p className="text-sm text-gray-500 italic mt-2">"{donation.message}"</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">₹{donation.amount?.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-gray-500">Donation Amount</p>
                  {donation.currency && (
                    <p className="text-xs text-gray-400">({donation.currency})</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <ReceiptRefundIcon className="h-5 w-5 mr-2 text-green-600" />
                Tax Information
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                This receipt serves as an official record for tax deduction purposes under Section 80G of the Income Tax Act, 1961.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-700 font-medium">Certificate No:</p>
                  <p className="text-gray-600">80G/HBF/2023-24/4567</p>
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Valid From:</p>
                  <p className="text-gray-600">01-Apr-2023 to 31-Mar-2024</p>
                </div>
              </div>
            </div>

            <div className="text-center text-gray-500 text-sm space-y-2">
              <p>Thank you for your generous contribution!</p>
              <p className="text-primary-600 font-medium">Your donation is making a difference in people's lives.</p>
              <p className="text-xs mt-4">
                For any queries, contact us at: support@hopebridge.org | Phone: +91-9876543210
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Close
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.print()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              Print Receipt
            </motion.button>
            {donation.receipt_url && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open(donation.receipt_url, '_blank')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Download PDF
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function History() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [stats, setStats] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDonations: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  useEffect(() => {
    if (user) {
      fetchDonations();
    }
  }, [user]);

  useEffect(() => {
    filterDonations();
  }, [donations, searchTerm, statusFilter, dateFilter]);

  const fetchDonations = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      
      // Fetch donations using the new donor dashboard endpoint
      const donationsResponse = await donationsAPI.getDonorDonations({
        page,
        limit,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      
      // Fetch stats using the stats endpoint
      const statsResponse = await donationsAPI.getDonorStats();

      if (donationsResponse.data?.success) {
        const donationsData = donationsResponse.data.data;
        setDonations(donationsData.donations || []);
        setPagination(donationsData.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalDonations: 0,
          hasNextPage: false,
          hasPrevPage: false
        });
      }

      if (statsResponse.data?.success) {
        const statsData = statsResponse.data.data;
        
        // Transform stats to match StatsCard component
        const transformedStats = [
          {
            name: 'Total Donations',
            value: statsData.summary?.totalDonations?.toString() || '0',
            change: statsData.stats?.[0]?.change || '+12%',
            changeType: statsData.stats?.[0]?.changeType || 'positive',
            description: 'All time donations',
            icon: CurrencyDollarIcon,
            color: 'from-primary-500 to-primary-600',
            bgColor: 'bg-primary-50'
          },
          {
            name: 'Total Amount',
            value: statsData.summary?.totalAmount ? 
              `₹${typeof statsData.summary.totalAmount === 'number' ? 
                statsData.summary.totalAmount.toLocaleString('en-IN') : 
                statsData.summary.totalAmount}` : '₹0',
            change: statsData.stats?.[1]?.change || '+23%',
            changeType: statsData.stats?.[1]?.changeType || 'positive',
            description: 'Total contributed',
            icon: ChartBarIcon,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'bg-green-50'
          },
          {
            name: 'Completed',
            value: statsData.summary?.completedDonations?.toString() || '0',
            change: '+8%',
            changeType: 'positive',
            description: 'Successful transactions',
            icon: CheckCircleIcon,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50'
          },
          {
            name: 'Recurring',
            value: statsData.summary?.recurringDonations?.toString() || '0',
            change: '+5%',
            changeType: 'positive',
            description: 'Active subscriptions',
            icon: CalendarIcon,
            color: 'from-amber-500 to-amber-600',
            bgColor: 'bg-amber-50'
          }
        ];
        
        setStats(transformedStats);
      }

    } catch (error) {
      console.error('Error fetching donations:', error);
      setFallbackStats();
    } finally {
      setLoading(false);
    }
  };

  const filterDonations = () => {
    let filtered = [...donations];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(donation =>
        (donation.causeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (donation.project?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (donation.razorpay_order_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (donation.message || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter (if not already filtered by API)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(donation => donation.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(donation => new Date(donation.createdAt) >= startDate);
    }

    setFilteredDonations(filtered);
  };

  const handleViewReceipt = (donation) => {
    setSelectedDonation(donation);
    setShowReceiptModal(true);
  };

  const handleDownloadReceipt = async (donation) => {
    try {
      if (donation.receipt_url) {
        window.open(donation.receipt_url, '_blank');
      } else {
        // Generate receipt URL or download
        const response = await donationsAPI.getReceipt(donation._id);
        if (response.data?.data?.receipt_url) {
          window.open(response.data.data.receipt_url, '_blank');
        } else {
          alert('Receipt not available for this donation');
        }
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt. Please try again.');
    }
  };

  const setFallbackStats = () => {
    setStats([
      {
        name: 'Total Donations',
        value: '0',
        change: '+0%',
        changeType: 'positive',
        description: 'All time donations',
        icon: CurrencyDollarIcon,
        color: 'from-primary-500 to-primary-600',
        bgColor: 'bg-primary-50'
      },
      {
        name: 'Total Amount',
        value: '₹0',
        change: '+0%',
        changeType: 'positive',
        description: 'Total contributed',
        icon: ChartBarIcon,
        color: 'from-green-500 to-emerald-600',
        bgColor: 'bg-green-50'
      },
      {
        name: 'Completed',
        value: '0',
        change: '+0%',
        changeType: 'positive',
        description: 'Successful transactions',
        icon: CheckCircleIcon,
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50'
      },
      {
        name: 'Recurring',
        value: '0',
        change: '+0%',
        changeType: 'positive',
        description: 'Active subscriptions',
        icon: CalendarIcon,
        color: 'from-amber-500 to-amber-600',
        bgColor: 'bg-amber-50'
      }
    ]);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchDonations(newPage);
    }
  };

  const handleExportAll = async () => {
    try {
      // This would typically call an export endpoint
      alert('Export feature coming soon!');
    } catch (error) {
      console.error('Error exporting donations:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/20 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Donation History</h1>
            <p className="mt-2 text-gray-600">Track all your donations and download receipts</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportAll}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center transition-colors duration-200"
            >
              <DownloadIcon className="h-5 w-5 mr-2" />
              Export All
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/donate'}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center transition-colors duration-200"
            >
              <CurrencyDollarIcon className="h-5 w-5 mr-2" />
              Donate Now
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatsCard key={stat.name} stat={stat} index={index} />
          ))}
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search donations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    fetchDonations(1); // Reset to first page with new filter
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
            </div>

            <div className="flex items-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchDonations(1)}
                className="w-full flex items-center justify-center px-4 py-2 text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-200"
              >
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                Refresh
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Results Info */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              Showing {filteredDonations.length} of {pagination.totalDonations} donations
            </p>
            {searchTerm && (
              <p className="text-sm text-gray-500 mt-1">
                Search results for: <span className="font-medium">"{searchTerm}"</span>
              </p>
            )}
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className={`px-3 py-1 rounded-lg ${pagination.hasPrevPage ? 
                  'bg-primary-600 text-white hover:bg-primary-700' : 
                  'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                Previous
              </motion.button>
              
              <span className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className={`px-3 py-1 rounded-lg ${pagination.hasNextPage ? 
                  'bg-primary-600 text-white hover:bg-primary-700' : 
                  'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                Next
              </motion.button>
            </div>
          )}
        </div>

        {/* Donations Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <DonationTable
            donations={filteredDonations}
            loading={loading}
            onViewReceipt={handleViewReceipt}
            onDownloadReceipt={handleDownloadReceipt}
          />
        </motion.div>

        {/* Receipt Modal */}
        <ReceiptModal
          donation={selectedDonation}
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
        />
      </div>
    </div>
  );
}