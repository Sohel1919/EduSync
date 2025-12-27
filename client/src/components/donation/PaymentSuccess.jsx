import { motion } from 'framer-motion';
import { CheckCircle2, Download, Mail, ArrowRight, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

export default function PaymentSuccess({ paymentData, onClose }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isReceiptGenerated, setIsReceiptGenerated] = useState(paymentData.receipt_generated || false);

  const downloadReceipt = async () => {
    if (!paymentData.receipt_url) {
      toast.error('Receipt is being generated. Please check back later.');
      return;
    }

    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      window.open(paymentData.receipt_url, '_blank');
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    } finally {
      setIsDownloading(false);
    }
  };

  const shareViaEmail = () => {
    const subject = `Education Donation Receipt - EduSync`;
    const body = `Thank you for supporting student education!\n\nDonation Details:\n- Amount: ₹${paymentData.amount}\n- Cause: ${paymentData.cause}\n- Payment ID: ${paymentData.paymentId}\n\nReceipt: ${paymentData.receipt_url || 'Will be available shortly'}\n\nYour contribution helps provide education to underprivileged students.`;
    
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
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
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You for Supporting Education!</h2>
        <p className="text-gray-600 mb-6">
          Your donation of <span className="font-semibold text-primary-600">₹{paymentData.amount}</span> for <span className="font-semibold">{paymentData.cause}</span> was successful.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Payment ID:</span>
            <span className="font-mono text-sm">{paymentData.paymentId?.slice(-8) || 'Processing...'}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold">₹{paymentData.amount}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Education Program:</span>
            <span className="font-semibold">{paymentData.cause}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Status:</span>
            <span className="font-semibold text-green-600">Completed</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Receipt:</span>
            {paymentData.receipt_url ? (
              <span className="font-semibold text-green-600">Generated ✓</span>
            ) : (
              <span className="font-semibold text-yellow-600 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Generating...
              </span>
            )}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={downloadReceipt}
            disabled={!paymentData.receipt_url || isDownloading}
            className={`flex-1 inline-flex items-center justify-center px-4 py-2 border rounded-lg transition-colors duration-200 ${
              !paymentData.receipt_url || isDownloading
                ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Receipt
              </>
            )}
          </button>
          <button
            onClick={shareViaEmail}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            <Mail className="h-4 w-4 mr-2" />
            Share
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center"
          >
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          A confirmation email has been sent to {paymentData.donorInfo?.email || 'your email address'}
        </p>
        
        {!paymentData.receipt_url && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <Clock className="h-4 w-4 inline mr-1" />
              Your receipt is being generated. It may take a few moments. You can download it from your donation history later.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}