
import React from 'react';
import Layout from '@/components/Layout';
import VerificationPortal from '@/components/VerificationPortal';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const EmployeePortalPage = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  // Show loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-500" />
        </div>
      </Layout>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth?mode=login" />;
  }
  
  // Redirect non-employees to the dashboard
  if (!user?.isEmployee) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <Layout>
      <VerificationPortal />
    </Layout>
  );
};

export default EmployeePortalPage;
