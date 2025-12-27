import { useState } from 'react';
import { motion } from 'framer-motion';
import { donationsAPI } from '../../services/apiService.js';
import { toast } from 'react-hot-toast';

export default function RazorpayButton({ 
  amount, 
  cause, 
  causeName,
  donorInfo, 
  onSuccess, 
  onError 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.error('Razorpay script failed to load');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const checkPaymentGateway = async () => {
    try {
      const response = await donationsAPI.getStatus();
      return response.data.paymentGateway.configured;
    } catch (error) {
      console.error('Error checking payment gateway:', error);
      return false;
    }
  };

  const handlePayment = async () => {
    if (!amount || amount < 100) {
      toast.error('Please enter a valid amount (minimum ₹100)');
      return;
    }

    setIsLoading(true);

    try {
      const isGatewayReady = await checkPaymentGateway();
      if (!isGatewayReady) {
        throw new Error('Payment gateway is currently unavailable. Please try again later.');
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Payment service failed to load. Please refresh the page and try again.');
      }

      const orderResponse = await donationsAPI.createOrder({
        amount,
        cause,
        causeName,
        donorInfo
      });

      const orderData = orderResponse.data;

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create payment order');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'EduSync - Education for All',
        description: `Education donation for ${causeName}`,
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            setIsProcessingPayment(true);
            toast.loading('Verifying payment and generating receipt...', {
              duration: 30000,
            });

            const verificationResponse = await donationsAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              method: response.method,
              bank: response.bank,
              wallet: response.wallet
            });

            const verificationData = verificationResponse.data;

            if (verificationData.success) {
              toast.dismiss();
              toast.success('Payment verified successfully!');
              
              onSuccess({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                amount: amount,
                cause: causeName,
                donorInfo: donorInfo,
                receipt_url: verificationData.donation.receipt_url,
                receipt_generated: verificationData.donation.receipt_generated
              });
            } else {
              throw new Error(verificationData.message || 'Payment verification failed');
            }
          } catch (error) {
            toast.dismiss();
            onError(error);
            toast.error('Payment verification failed. Please contact support.');
          } finally {
            setIsProcessingPayment(false);
            setIsLoading(false);
          }
        },
        prefill: {
          name: donorInfo.name || '',
          email: donorInfo.email || '',
          contact: donorInfo.phone || ''
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
            toast.error('Payment cancelled');
          }
        },
        notes: {
          cause: cause,
          causeName: causeName
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      onError(error);
      toast.error(error.message || 'Payment failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handlePayment}
        disabled={isLoading || !amount || amount < 100 || isProcessingPayment}
        className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading || isProcessingPayment ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            {isProcessingPayment ? 'Processing...' : 'Loading...'}
          </div>
        ) : (
          `Support Education - ₹${amount}`
        )}
      </motion.button>

      {isProcessingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Your Donation</h3>
            <p className="text-gray-600 mb-4">
              Please wait while we verify your payment and generate your receipt...
            </p>
            <div className="text-sm text-gray-500">
              This usually takes 10-15 seconds
            </div>
          </div>
        </div>
      )}
    </>
  );
}