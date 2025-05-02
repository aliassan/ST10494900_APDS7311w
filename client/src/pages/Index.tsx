
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="w-full md:w-1/2 space-y-6 animate-fade-in">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-navy-100 text-navy-800">
                <ShieldCheck className="h-4 w-4 mr-2" />
                Secure & Reliable International Transfers
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy-900 leading-tight">
                Global Payments <br />
                <span className="text-navy-500">Made Simple</span>
              </h1>
              <p className="text-lg text-navy-700 md:pr-12">
                Send money internationally with speed, security, and transparency. 
                Low fees, competitive exchange rates, and a seamless experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {isAuthenticated ? (
                  <Link to={user?.isEmployee ? "/employee-portal" : "/dashboard"}>
                    <Button className="btn-primary">
                      <span>Go to {user?.isEmployee ? "Verification Portal" : "Dashboard"}</span>
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/auth?mode=register">
                      <Button className="btn-primary w-full sm:w-auto">
                        <span>Get Started</span>
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link to="/auth?mode=login">
                      <Button variant="outline" className="btn-secondary w-full sm:w-auto">
                        <span>Log In</span>
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="w-full md:w-1/2 animate-fade-in [animation-delay:200ms]">
              <div className="glass-panel shadow-glass-lg p-1 rounded-xl border border-white/30 backdrop-blur-sm overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-navy-100/40 to-transparent opacity-60"></div>
                <div className="relative p-6 sm:p-8 rounded-lg glass-panel bg-white/90">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-navy-500 text-white flex items-center justify-center">
                        <Globe className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-medium text-navy-900">International Wire Transfer</h3>
                        <p className="text-sm text-navy-600">SWIFT Payment</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-navy-600">Reference</p>
                      <p className="font-mono text-navy-800 font-medium">INV-20231019-001</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-navy-600 mb-1">Amount</p>
                        <p className="text-2xl font-bold text-navy-900">$5,000.00</p>
                      </div>
                      <div>
                        <p className="text-sm text-navy-600 mb-1">Fee</p>
                        <p className="text-navy-900">$25.00</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-navy-600 mb-1">From</p>
                        <p className="font-medium text-navy-900">John Doe</p>
                        <p className="text-sm text-navy-700">Acct: *****7890</p>
                      </div>
                      <div>
                        <p className="text-sm text-navy-600 mb-1">To</p>
                        <p className="font-medium text-navy-900">Maria Garcia</p>
                        <p className="text-sm text-navy-700">Santander Bank, Spain</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                      <div className="flex items-center text-success-600">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <span className="font-medium">Processed</span>
                      </div>
                      <p className="text-navy-600 text-sm">Oct 19, 2023</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-navy-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-800 mb-4">Why Choose Global Pay</h2>
            <p className="max-w-2xl mx-auto text-navy-600">
              Our innovative platform provides you with everything you need to make international payments simply and securely.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all animate-fade-in">
              <div className="h-12 w-12 rounded-lg bg-navy-100 flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-navy-500" />
              </div>
              <h3 className="text-xl font-semibold text-navy-800 mb-2">Bank-Level Security</h3>
              <p className="text-navy-600">
                Your transactions are protected with state-of-the-art encryption and security protocols.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all animate-fade-in [animation-delay:100ms]">
              <div className="h-12 w-12 rounded-lg bg-navy-100 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-navy-500" />
              </div>
              <h3 className="text-xl font-semibold text-navy-800 mb-2">Fast Transfers</h3>
              <p className="text-navy-600">
                Send money internationally with quick processing times and transparent tracking.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all animate-fade-in [animation-delay:200ms]">
              <div className="h-12 w-12 rounded-lg bg-navy-100 flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-navy-500" />
              </div>
              <h3 className="text-xl font-semibold text-navy-800 mb-2">Competitive Rates</h3>
              <p className="text-navy-600">
                Get the best exchange rates and low, transparent fees on all your international transfers.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-navy-800 to-navy-600 rounded-xl overflow-hidden shadow-xl">
            <div className="px-6 py-12 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-8 md:mb-0 md:pr-8 text-white">
                  <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
                  <p className="text-navy-100 max-w-lg">
                    Join thousands of customers who trust Global Pay for their international payment needs. Register in minutes and start sending money globally.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/auth?mode=register">
                    <Button size="lg" className="bg-white text-navy-800 hover:bg-gray-100 transition-colors">
                      Create Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/auth?mode=login">
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-navy-700 transition-colors">
                      Log In
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
