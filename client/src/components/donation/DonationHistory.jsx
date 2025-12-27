import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Clock,
  FileText,
  Download,
  RefreshCw
} from 'lucide-react';
import { donationsAPI } from '../../services/apiService.js';
import { toast } from 'react-hot-toast';

const statusConfig = {
  completed: { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100' },
  failed: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
  pending: { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  cancelled: { icon: XCircle, color: 'text-gray-600', bgColor: 'bg-gray-100' }
};

export default function DonationHistory() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    totalAmount: 0
  });

  useEffect(() => {
    fetchDonationHistory();
  }, []);

  const fetchDonationHistory = async (page = 1) => {
    try {
      setLoading(true);
      const response = await donationsAPI.getUserDonations({ page, limit: 10 });
      const data = response.data;
      setDonations(data.donations || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Error fetching donation history:', error);
      if (error.response?.status !== 401) {
        toast.error('Failed to load donation history');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const downloadReceipt = async (donationId) => {
    try {
      const response = await donationsAPI.getById(donationId);
      const donation = response.data.donation;
      
      if (donation.receipt_url) {
        window.open(donation.receipt_url, '_blank');
      } else {
        toast.error('Receipt not available for this donation');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (donations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Donations Yet</h3>
          <p className="text-gray-500 mb-6">Your donation history will appear here once you make your first contribution to student education.</p>
          <button
            onClick={() => fetchDonationHistory()}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-xl p-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Education Support History</h2>
          <p className="text-gray-600 mt-1">Your generous contributions to EduSync</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Impact</p>
          <p className="text-xl font-bold text-primary-600">
            {formatAmount(pagination.totalAmount)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {donations.map((donation, index) => {
          const StatusIcon = statusConfig[donation.status]?.icon || Clock;
          const statusColor = statusConfig[donation.status]?.color || 'text-gray-600';
          const statusBgColor = statusConfig[donation.status]?.bgColor || 'bg-gray-100';

          return (
            <motion.div
              key={donation._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${statusBgColor}`}>
                  <StatusIcon className={`h-5 w-5 ${statusColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{donation.causeName}</h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(donation.createdAt)} • 
                    {donation.razorpay_payment_id ? ` Payment ID: ${donation.razorpay_payment_id.slice(-8)}` : ' Order ID: ' + donation.razorpay_order_id.slice(-8)}
                  </p>
                </div>
              </div>
              
              <div className="text-right flex items-center space-x-4">
                <div>
                  <p className={`text-lg font-bold ${
                    donation.status === 'completed' ? 'text-green-600' : 
                    donation.status === 'failed' ? 'text-red-600' : 
                    donation.status === 'pending' ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {formatAmount(donation.amount)}
                  </p>
                  <p className={`text-sm capitalize ${
                    donation.status === 'completed' ? 'text-green-600' : 
                    donation.status === 'failed' ? 'text-red-600' : 
                    donation.status === 'pending' ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {donation.status}
                  </p>
                </div>
                
                {donation.status === 'completed' && donation.receipt_url && (
                  <button
                    onClick={() => downloadReceipt(donation._id)}
                    className="text-primary-600 hover:text-primary-700 transition-colors"
                    title="Download Receipt"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex justify-center space-x-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchDonationHistory(page)}
              className={`px-3 py-1 rounded ${
                pagination.current === page
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {donations.filter(d => d.status === 'completed').length}
          </p>
          <p className="text-sm text-gray-600">Successful</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-600">
            {donations.length}
          </p>
          <p className="text-sm text-gray-600">Total Contributions</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary-600">
            {formatAmount(pagination.totalAmount)}
          </p>
          <p className="text-sm text-gray-600">Total Educational Impact</p>
        </div>
      </div>
    </motion.div>
  );
}