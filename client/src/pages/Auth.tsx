
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import Layout from '@/components/Layout';
import { Globe } from 'lucide-react';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') as 'login' | 'register' || 'login';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center text-center mb-8 animate-fade-in">
          <Globe className="h-12 w-12 text-navy-500 mb-4" />
          <h1 className="text-3xl sm:text-4xl font-semibold text-navy-800 mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Join Global Pay'}
          </h1>
          <p className="text-lg text-navy-600 max-w-2xl">
            {mode === 'login'
              ? 'Access your secure international payments platform'
              : 'Create an account to start making secure international transfers'}
          </p>
        </div>
        
        <div className="animate-fade-in">
          <AuthForm defaultMode={mode} />
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
