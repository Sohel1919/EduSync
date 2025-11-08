import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { mockDonationHistory } from '../../services/paymentService';

const statusConfig = {
  completed: { icon: CheckCircleIcon, color: 'text-green-600', bgColor: 'bg-green-100' },
  failed: { icon: XCircleIcon, color: 'text-red-600', bgColor: 'bg-red-100' },
  pending: { icon: ClockIcon, color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
};

export default function DonationHistory({ donations = mockDonationHistory }) {
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

  if (donations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Donations Yet</h3>
        <p className="text-gray-500">Your donation history will appear here</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Donation History</h2>
          <p className="text-gray-600 mt-1">Your generous contributions to HopeBridge</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Donated</p>
          <p className="text-xl font-bold text-primary-600">
            {formatAmount(donations.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.amount, 0))}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {donations.map((donation, index) => {
          const StatusIcon = statusConfig[donation.status]?.icon || ClockIcon;
          const statusColor = statusConfig[donation.status]?.color || 'text-gray-600';
          const statusBgColor = statusConfig[donation.status]?.bgColor || 'bg-gray-100';

          return (
            <motion.div
              key={donation.id}
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
                  <h3 className="font-semibold text-gray-900">{donation.cause}</h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(donation.date)} • {donation.receipt}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`text-lg font-bold ${
                  donation.status === 'completed' ? 'text-green-600' : 
                  donation.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {formatAmount(donation.amount)}
                </p>
                <p className={`text-sm capitalize ${
                  donation.status === 'completed' ? 'text-green-600' : 
                  donation.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {donation.status}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary-600">
            {donations.filter(d => d.status === 'completed').length}
          </p>
          <p className="text-sm text-gray-600">Successful</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-600">
            {donations.length}
          </p>
          <p className="text-sm text-gray-600">Total Donations</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {formatAmount(donations.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.amount, 0))}
          </p>
          <p className="text-sm text-gray-600">Total Impact</p>
        </div>
      </div>
    </motion.div>
  );
}