import { motion } from 'framer-motion';
import { CheckCircleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function PaymentSuccess({ paymentData, onClose }) {
  const downloadReceipt = () => {
    // Implement receipt download logic
    const receiptContent = `
      HopeBridge NGO Donation Receipt
      
      Receipt No: HB-${Date.now()}
      Date: ${new Date().toLocaleDateString()}
      Payment ID: ${paymentData.paymentId}
      Amount: ₹${paymentData.amount}
      Cause: ${paymentData.cause}
      
      Thank you for your generous donation!
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HopeBridge-Receipt-${paymentData.paymentId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircleIcon className="h-8 w-8 text-green-600" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
        <p className="text-gray-600 mb-6">
          Your donation of <span className="font-semibold text-primary-600">₹{paymentData.amount}</span> for <span className="font-semibold">{paymentData.cause}</span> was successful.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Payment ID:</span>
            <span className="font-mono text-sm">{paymentData.paymentId}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold">₹{paymentData.amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Cause:</span>
            <span className="font-semibold">{paymentData.cause}</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={downloadReceipt}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Receipt
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Continue
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}