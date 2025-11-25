import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/apiService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configure toast options globally
  useEffect(() => {
    // This ensures consistent toast styling throughout the app
    const defaultToastOptions = {
      position: 'top-center',
      duration: 4000,
      style: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        borderRadius: '12px',
        padding: '16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    };

    // Override toast methods with consistent styling
    const originalSuccess = toast.success;
    const originalError = toast.error;
    const originalLoading = toast.loading;

    toast.success = (message, options) => 
      originalSuccess(message, {
        ...defaultToastOptions,
        style: {
          ...defaultToastOptions.style,
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#10B981',
        },
        ...options
      });

    toast.error = (message, options) => 
      originalError(message, {
        ...defaultToastOptions,
        style: {
          ...defaultToastOptions.style,
          background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#EF4444',
        },
        ...options
      });

    toast.loading = (message, options) => 
      originalLoading(message, {
        ...defaultToastOptions,
        style: {
          ...defaultToastOptions.style,
          background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
        },
        ...options
      });
  }, []);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data.user);
          console.log('User authenticated:', response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
          toast.error('Session expired. Please login again.');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('Login attempt:', email);
      const response = await authAPI.login({ email, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      console.log('Login successful:', userData);
      toast.success('Login successful! Redirecting to profile...');
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('Register attempt:', {
        name: userData.get('name'),
        email: userData.get('email'),
        hasAvatar: userData.get('avatar') ? 'Yes' : 'No'
      });
      
      const response = await authAPI.register(userData);
      
      console.log('Registration successful:', response.data);
      toast.success('Registration successful! Please check your email for verification.');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Register error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email, token) => {
    try {
      setLoading(true);
      const response = await authAPI.verifyEmail({ email, token });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      console.log('Email verification successful:', userData);
      toast.success('Email verified successfully!');
      return { success: true, user: userData };
    } catch (error) {
      console.error('Email verification error:', error);
      const errorMessage = error.response?.data?.message || 'Verification failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async (email) => {
    try {
      setLoading(true);
      await authAPI.resendVerification({ email });
      toast.success('Verification email sent! Please check your inbox.');
      return { success: true };
    } catch (error) {
      console.error('Resend verification error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to resend verification email.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out user');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      console.log('Update profile attempt:', {
        hasAvatar: profileData.get('avatar') ? 'Yes' : 'No',
        name: profileData.get('name')
      });
      
      const response = await authAPI.updateProfile(profileData);
      setUser(response.data.user);
      
      console.log('Profile updated successfully:', response.data.user);
      toast.success('Profile updated successfully!');
      return { success: true, user: response.data.user };
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.message || 'Profile update failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      await authAPI.changePassword(passwordData);
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      const errorMessage = error.response?.data?.message || 'Password change failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      setLoading(true);
      await authAPI.deleteAccount();
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      toast.success('Account deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Delete account error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete account. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      await authAPI.forgotPassword({ email });
      toast.success('Password reset instructions sent to your email!');
      return { success: true };
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send reset instructions. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      await authAPI.resetPassword({ token, newPassword });
      toast.success('Password reset successfully! You can now login with your new password.');
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || 'Password reset failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data.user);
      console.log('User data refreshed:', response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      return { success: false, error: error.message };
    }
  };

  // Helper function to get user avatar URL with fallback
  const getUserAvatar = () => {
    if (user?.avatar?.url && user.avatar.url !== 'https://res.cloudinary.com/demo/image/upload/v1624391337/default-avatar.png') {
      return user.avatar.url;
    }
    return null; 
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    verifyEmail,
    resendVerification,
    logout,
    updateProfile,
    changePassword,
    deleteAccount,
    forgotPassword,
    resetPassword,
    refreshUser,
    getUserAvatar,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isVolunteer: user?.role === 'volunteer',
    isDonor: user?.role === 'donor',
    isBeneficiary: user?.role === 'beneficiary',
    isUser: user?.role === 'user',
    hasAvatar: user?.avatar?.url && user.avatar.url !== 'https://res.cloudinary.com/demo/image/upload/v1624391337/default-avatar.png'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};