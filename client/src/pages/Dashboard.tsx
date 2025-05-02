
import React from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const DashboardPage = () => {
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
  
  // Redirect employees to the employee portal
  if (user?.isEmployee) {
    return <Navigate to="/employee-portal" />;
  }
  
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

export default DashboardPage;
