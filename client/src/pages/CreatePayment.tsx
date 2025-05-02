
import React from 'react';
import Layout from '@/components/Layout';
import PaymentForm from '@/components/PaymentForm';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const CreatePaymentPage = () => {
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-3xl font-semibold text-navy-800 mb-2">
            International Payment
          </h1>
          <p className="text-lg text-navy-600">
            Send money securely anywhere in the world
          </p>
        </div>
        
        <PaymentForm />
      </div>
    </Layout>
  );
};

export default CreatePaymentPage;
