
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Globe, Home, LogOut, UserCircle, CreditCard, 
  ChevronRight, Menu, X, Shield 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="relative z-40 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Globe className="h-8 w-8 text-navy-500" />
            <span className="text-xl font-semibold text-navy-700">Global Pay</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link to={user?.isEmployee ? '/employee-portal' : '/dashboard'} className="text-navy-700 hover:text-navy-500 transition-colors">
                  {user?.isEmployee ? 'Verification Portal' : 'Dashboard'}
                </Link>
                {!user?.isEmployee && (
                  <Link to="/create-payment" className="text-navy-700 hover:text-navy-500 transition-colors">
                    New Payment
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-navy-500 font-medium">{user?.fullName}</span>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-1" />
                    <span>Logout</span>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/" className="text-navy-700 hover:text-navy-500 transition-colors">Home</Link>
                <Link to="/auth?mode=login" className="text-navy-700 hover:text-navy-500 transition-colors">Login</Link>
                <Link to="/auth?mode=register">
                  <Button className="btn-primary">
                    Register <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          <button 
            className="md:hidden text-navy-700 focus:outline-none"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Mobile menu */}
        <div 
          className={cn(
            "absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm shadow-md md:hidden z-40 transition-all duration-300 ease-in-out",
            isMobileMenuOpen ? "max-h-screen p-4" : "max-h-0 overflow-hidden p-0"
          )}
        >
          <div className="flex flex-col space-y-4">
            {isAuthenticated ? (
              <>
                <div className="border-b border-gray-200 pb-2 mb-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <UserCircle className="h-5 w-5 text-navy-500" />
                    <span className="font-medium">{user?.fullName}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Account: {user?.accountNumber}
                  </div>
                </div>
                <Link 
                  to={user?.isEmployee ? '/employee-portal' : '/dashboard'} 
                  className="flex items-center space-x-2 px-2 py-2 rounded hover:bg-navy-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {user?.isEmployee ? <Shield className="h-5 w-5" /> : <Home className="h-5 w-5" />}
                  <span>{user?.isEmployee ? 'Verification Portal' : 'Dashboard'}</span>
                </Link>
                {!user?.isEmployee && (
                  <Link 
                    to="/create-payment" 
                    className="flex items-center space-x-2 px-2 py-2 rounded hover:bg-navy-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <CreditCard className="h-5 w-5" />
                    <span>New Payment</span>
                  </Link>
                )}
                <button 
                  className="flex items-center space-x-2 px-2 py-2 rounded hover:bg-navy-50 text-left"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/" 
                  className="flex items-center space-x-2 px-2 py-2 rounded hover:bg-navy-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </Link>
                <Link 
                  to="/auth?mode=login" 
                  className="flex items-center space-x-2 px-2 py-2 rounded hover:bg-navy-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserCircle className="h-5 w-5" />
                  <span>Login</span>
                </Link>
                <Link 
                  to="/auth?mode=register"
                  className="flex items-center space-x-2 px-2 py-2 bg-navy-500 text-white rounded"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserCircle className="h-5 w-5" />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow bg-gradient-to-br from-secondary to-background">
        <div className="container mx-auto px-4 py-6 md:py-10 animate-fade-in">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-navy-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <Globe className="h-6 w-6" />
                <span className="text-lg font-semibold">Global Pay</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">Secure international payments</p>
            </div>
            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Global Pay. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
