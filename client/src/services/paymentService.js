import axios from 'axios';

const RAZORPAY_CONFIG = {
  key: import.meta.env.REACT_APP_RAZORPAY_KEY_ID,
  currency: 'INR',
  name: 'HopeBridge NGO',
  description: 'Donation for Social Cause',
  prefill: {
    name: '',
    email: '',
    contact: ''
  },
  theme: {
    color: '#667eea'
  }
};

export const paymentService = {
  // Create order on your backend
  createOrder: async (amount) => {
    try {
      const response = await axios.post('/api/payments/create-order', {
        amount: amount * 100, // Convert to paise
        currency: 'INR'
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to create order');
    }
  },

  // Verify payment on your backend
  verifyPayment: async (paymentData) => {
    try {
      const response = await axios.post('/api/payments/verify', paymentData);
      return response.data;
    } catch (error) {
      throw new Error('Payment verification failed');
    }
  },

  // Initialize Razorpay
  initializeRazorpay: (options) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(new window.Razorpay(options));
      };
      script.onerror = () => {
        throw new Error('Razorpay SDK failed to load');
      };
      document.body.appendChild(script);
    });
  }
};

// Mock data for demonstration
export const mockDonationHistory = [
  {
    id: '1',
    amount: 2500,
    currency: 'INR',
    status: 'completed',
    paymentId: 'pay_123456',
    date: '2024-12-15T10:30:00Z',
    cause: 'Education for All',
    receipt: 'HB-001234'
  },
  {
    id: '2',
    amount: 1000,
    currency: 'INR',
    status: 'completed',
    paymentId: 'pay_123457',
    date: '2024-12-10T14:20:00Z',
    cause: 'Healthcare Access',
    receipt: 'HB-001235'
  },
  {
    id: '3',
    amount: 5000,
    currency: 'INR',
    status: 'failed',
    paymentId: 'pay_123458',
    date: '2024-12-05T09:15:00Z',
    cause: 'Women Empowerment',
    receipt: 'HB-001236'
  }
];