// client/src/context/RoleContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const RoleContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export const RoleProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      setUserRole(user.role);
      setLoading(false);
    } else if (!isAuthenticated) {
      setUserRole(null);
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const updateUserRole = async (newRole) => {
    // This would need to be implemented with your backend API
    console.log('Role update requested:', newRole);
    setUserRole(newRole);
  };

  const value = {
    userRole,
    loading,
    updateUserRole,
    isAdmin: userRole === 'admin',
    isVolunteer: userRole === 'volunteer',
    isBeneficiary: userRole === 'beneficiary',
    isDonor: userRole === 'donor',
    isUser: userRole === 'user'
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};