import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  CalendarIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { donationsAPI } from '../../services/apiService';

// Updated Chart components for education-focused data
const DonationChart = ({ data }) => {
  const hasData = data && data.some(item => item.value > 0);
  
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg">
      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
        Education Donations Overview
      </h4>
      
      {hasData ? (
        <div className="h-48 flex items-end justify-between space-x-2">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <motion.div
                className="w-full bg-gradient-to-t from-blue-500 to-green-600 rounded-t-lg transition-all duration-500 hover:opacity-80"
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(item.value, 5)}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              />
              <span className="text-xs text-gray-500 mt-2">{item.label}</span>
              <span className="text-xs text-gray-400 mt-1">
                {item.value > 0 ? `${Math.round(item.value)}%` : ''}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <ChartBarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No education donation data available</p>
            <p className="text-sm">Donations will appear here once received</p>
          </div>
        </div>
      )}
    </div>
  );
};

const PieChart = ({ data }) => {
  const hasData = data && data.length > 0;
  const total = hasData ? data.reduce((sum, item) => sum + item.value, 0) : 0;
  
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg">
      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
        Education Program Distribution
      </h4>
      
      {hasData ? (
        <>
          <div className="flex justify-center items-center h-40">
            <div className="relative w-32 h-32">
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const rotation = data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0);
                
                return (
                  <div
                    key={index}
                    className="absolute top-0 left-0 w-full h-full rounded-full"
                    style={{
                      background: `conic-gradient(${item.color} 0deg ${rotation + percentage * 3.6}deg, transparent ${rotation + percentage * 3.6}deg 360deg)`
                    }}
                  />
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 mt-4">
            {data.map((item, index) => {
              const percentage = ((item.value / total) * 100).toFixed(1);
              return (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <div className="text-gray-500 font-medium">
                    {item.value} ({percentage}%)
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="h-40 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <CurrencyDollarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No program distribution data available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCause, setSelectedCause] = useState('all');
  const [timeRange, setTimeRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
    recurring: 0
  });
  const [chartData, setChartData] = useState({
    monthly: [],
    paymentMethods: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching education donation dashboard data...');
      
      const donationsResponse = await donationsAPI.getAllDonations();
      const statsResponse = await donationsAPI.getStatistics();

      const donationsData = donationsResponse.data.donations || donationsResponse.data.data || [];
      setDonations(donationsData);
      setFilteredDonations(donationsData);

      let statsData = {};
      
      if (statsResponse.data.statistics) {
        statsData = statsResponse.data.statistics;
      } else if (statsResponse.data.data) {
        statsData = statsResponse.data.data;
      } else {
        statsData = calculateStatsFromDonations(donationsData);
      }

      setStats({
        total: statsData.total || donationsData.length,
        completed: statsData.completed || donationsData.filter(d => d.status === 'completed').length,
        pending: statsData.pending || donationsData.filter(d => d.status === 'pending').length,
        failed: statsData.failed || donationsData.filter(d => d.status === 'failed').length,
        totalAmount: statsData.totalAmount || donationsData.filter(d => d.status === 'completed').reduce((sum, d) => sum + (d.amount || 0), 0),
        recurring: statsData.recurring || 0
      });

      setChartData({
        monthly: transformMonthlyData(statsData.monthlyData || []),
        paymentMethods: transformPaymentMethodData(statsData.paymentMethods || [])
      });
      
    } catch (error) {
      console.error('Error fetching education donation data:', error);
      const donationsData = donationsResponse?.data?.donations || donationsResponse?.data?.data || [];
      const fallbackStats = calculateStatsFromDonations(donationsData);
      setStats(fallbackStats);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatsFromDonations = (donationsData) => {
    const completedDonations = donationsData.filter(d => d.status === 'completed');
    const totalAmount = completedDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
    
    return {
      total: donationsData.length,
      completed: completedDonations.length,
      pending: donationsData.filter(d => d.status === 'pending').length,
      failed: donationsData.filter(d => d.status === 'failed').length,
      totalAmount: totalAmount,
      recurring: 0
    };
  };

  const transformMonthlyData = (monthlyData) => {
    if (!monthlyData || monthlyData.length === 0) {
      return Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        return {
          label: date.toLocaleDateString('en-US', { month: 'short' }),
          value: 0
        };
      });
    }

    const maxAmount = Math.max(...monthlyData.map(item => item.amount || 0));
    const scaleFactor = maxAmount > 0 ? 100 / maxAmount : 0;

    return monthlyData.map(item => {
      const month = item._id?.month || new Date().getMonth() + 1;
      const year = item._id?.year || new Date().getFullYear();
      const date = new Date(year, month - 1);
      
      return {
        label: date.toLocaleDateString('en-US', { month: 'short' }),
        value: Math.round((item.amount || 0) * scaleFactor)
      };
    });
  };

  const transformPaymentMethodData = (paymentMethods) => {
    if (!paymentMethods || paymentMethods.length === 0) {
      return [];
    }

    const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];
    
    return paymentMethods
      .filter(method => method._id && method.count > 0)
      .map((method, index) => ({
        name: formatPaymentMethodName(method._id),
        value: method.count,
        color: colors[index % colors.length]
      }));
  };

  const formatPaymentMethodName = (method) => {
    if (!method) return 'Unknown';
    
    const methodMap = {
      'upi': 'UPI',
      'card': 'Card',
      'netbanking': 'Net Banking',
      'wallet': 'Wallet',
      'credit_card': 'Credit Card',
      'debit_card': 'Debit Card',
      'net_banking': 'Net Banking',
      'unknown': 'Other'
    };
    
    return methodMap[method.toLowerCase()] || method;
  };

  useEffect(() => {
    let filtered = donations.filter(donation => {
      const searchLower = searchTerm.toLowerCase();
      const donorName = donation.donor_info?.name || donation.donor?.name || 'Education Supporter';
      const donorEmail = donation.donor_info?.email || donation.donor?.email || '';
      
      const matchesSearch = 
        donorName.toLowerCase().includes(searchLower) ||
        donorEmail.toLowerCase().includes(searchLower) ||
        donation.causeName?.toLowerCase().includes(searchLower) ||
        donation.razorpay_order_id?.toLowerCase().includes(searchLower) ||
        (donation.razorpay_payment_id && donation.razorpay_payment_id.toLowerCase().includes(searchLower));
      
      const matchesStatus = selectedStatus === 'all' || donation.status === selectedStatus;
      const matchesCause = selectedCause === 'all' || donation.cause === selectedCause;
      
      return matchesSearch && matchesStatus && matchesCause;
    });

    setFilteredDonations(filtered);
  }, [donations, searchTerm, selectedStatus, selectedCause]);

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return `₹${amount?.toLocaleString('en-IN') || '0'}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleViewReceipt = async (donationId) => {
    try {
      const response = await donationsAPI.getReceipt(donationId);
      if (response.data.success) {
        const receiptWindow = window.open('', '_blank');
        const receiptData = response.data.receipt;
        
        receiptWindow.document.write(`
          <html>
            <head>
              <title>Education Donation Receipt - ${receiptData.receiptId}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .details { margin: 30px 0; }
                .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
                .footer { margin-top: 40px; text-align: center; color: #666; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>EDUCATION DONATION RECEIPT</h1>
                <p>EduSync - Empowering Students Through Education</p>
                <p>Receipt ID: ${receiptData.receiptId}</p>
              </div>
              <div class="details">
                <div class="detail-row">
                  <strong>Donor Name:</strong>
                  <span>${receiptData.donorName}</span>
                </div>
                <div class="detail-row">
                  <strong>Amount:</strong>
                  <span>${formatCurrency(receiptData.amount)}</span>
                </div>
                <div class="detail-row">
                  <strong>Education Program:</strong>
                  <span>${receiptData.cause}</span>
                </div>
                <div class="detail-row">
                  <strong>Payment Method:</strong>
                  <span>${receiptData.paymentMethod}</span>
                </div>
                <div class="detail-row">
                  <strong>Transaction ID:</strong>
                  <span>${receiptData.transactionId}</span>
                </div>
                <div class="detail-row">
                  <strong>Date:</strong>
                  <span>${formatDate(receiptData.date)}</span>
                </div>
              </div>
              <div class="footer">
                <p>Thank you for supporting student education!</p>
                <p>This is a computer generated receipt.</p>
              </div>
            </body>
          </html>
        `);
        
        receiptWindow.document.close();
      }
    } catch (error) {
      console.error('Error fetching receipt:', error);
      alert('Failed to generate receipt. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading education donation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <motion.h1 
              className="text-3xl font-bold text-gray-900"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Education Donation Management
            </motion.h1>
            <motion.p 
              className="text-gray-600 mt-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Manage and track all education donations with detailed analytics
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200"
          >
            <CurrencyDollarIcon className="h-5 w-5" />
            <span className="font-semibold">{formatCurrency(stats.totalAmount)}</span>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              name: 'Total Education Donations', 
              value: stats.total, 
              amount: formatCurrency(stats.totalAmount),
              icon: CurrencyDollarIcon, 
              color: 'from-blue-500 to-blue-600',
              bgColor: 'bg-blue-50'
            },
            { 
              name: 'Successful', 
              value: stats.completed, 
              amount: formatCurrency(stats.totalAmount),
              icon: CheckCircleIcon, 
              color: 'from-green-500 to-emerald-600',
              bgColor: 'bg-green-50'
            },
            { 
              name: 'Pending', 
              value: stats.pending, 
              amount: formatCurrency(donations.filter(d => d.status === 'pending').reduce((sum, d) => sum + (d.amount || 0), 0)),
              icon: ClockIcon, 
              color: 'from-yellow-500 to-amber-600',
              bgColor: 'bg-yellow-50'
            },
            { 
              name: 'Education Supporters', 
              value: stats.recurring, 
              amount: `${stats.total > 0 ? Math.round((stats.recurring / stats.total) * 100) : 0}%`,
              icon: UsersIcon, 
              color: 'from-purple-500 to-purple-600',
              bgColor: 'bg-purple-50'
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.name}
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
                    <p className="text-sm text-blue-600 font-semibold mt-1">{stat.amount}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} text-white`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <DonationChart data={chartData.monthly} />
          </div>
          <div>
            <PieChart data={chartData.paymentMethods} />
          </div>
        </div>

        {/* Filters and Search */}
        <motion.div 
          className="bg-white shadow-lg rounded-xl border border-gray-200 p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-blue-400" />
              </div>
              <input
                type="text"
                placeholder="Search education donations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Education Program Filter */}
            <select
              value={selectedCause}
              onChange={(e) => setSelectedCause(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            >
              <option value="all">All Education Programs</option>
              <option value="scholarship">Student Scholarships</option>
              <option value="digital-learning">Digital Learning Labs</option>
              <option value="study-material">Study Material Kits</option>
              <option value="girl-education">Girl Child Education</option>
            </select>

            {/* Time Range Filter */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
        </motion.div>

        {/* Donations Table */}
        <motion.div 
          className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
              Education Donation Records ({filteredDonations.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Supporter & Program
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Payment Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDonations.map((donation, index) => (
                  <motion.tr
                    key={donation._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-blue-50/30 transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                          {donation.donor_info?.name || donation.donor?.name || 'Education Supporter'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {donation.donor_info?.email || donation.donor?.email || 'No email'}
                        </div>
                        <div className="text-sm text-blue-600 font-medium mt-1">
                          {donation.causeName}
                        </div>
                        {donation.donor_info?.isAnonymous && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                            Anonymous
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{donation.payment_method || 'Online Payment'}</div>
                      <div className="text-sm text-gray-500 font-mono">
                        {donation.razorpay_payment_id || donation.razorpay_order_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(donation.amount)}
                      </div>
                      <div className="text-sm text-gray-500">{donation.currency}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(donation.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(donation.createdAt)}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(donation.createdAt).toLocaleTimeString('en-IN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewReceipt(donation._id)}
                          className="inline-flex items-center p-2 border border-blue-300 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                          title="View Education Receipt"
                        >
                          <DocumentArrowDownIcon className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            
            {filteredDonations.length === 0 && (
              <div className="text-center py-12">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No education donations found</p>
                <p className="text-gray-400 text-sm mt-2">
                  {searchTerm || selectedStatus !== 'all' || selectedCause !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'No education donations have been made yet'
                  }
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}