import { useState } from 'react';
import { motion } from 'framer-motion';
import { paymentService } from '../../services/paymentService';
import { toast } from 'react-hot-toast';

export default function RazorpayButton({ 
  amount, 
  cause, 
  donorInfo, 
  onSuccess, 
  onError 
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (!amount || amount < 10) {
      toast.error('Please enter a valid amount (minimum ₹10)');
      return;
    }

    setIsLoading(true);

    try {
      // Create order on your backend
      const order = await paymentService.createOrder(amount);
      
      // Initialize Razorpay
      const razorpay = await paymentService.initializeRazorpay({
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'HopeBridge NGO',
        description: `Donation for ${cause}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // Verify payment on your backend
            const verification = await paymentService.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verification.success) {
              onSuccess({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                amount: amount,
                cause: cause,
                donorInfo: donorInfo
              });
              toast.success('Donation successful! Thank you for your generosity.');
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            onError(error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: donorInfo.name || '',
          email: donorInfo.email || '',
          contact: donorInfo.phone || ''
        },
        theme: {
          color: '#667eea'
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
            toast.error('Payment cancelled');
          }
        }
      });

      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      onError(error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handlePayment}
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          Processing...
        </div>
      ) : (
        `Donate ₹${amount}`
      )}
    </motion.button>
  );
}