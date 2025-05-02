
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Define user types
export type User = {
  id: string;
  fullName: string;
  accountNumber: string;
  idNumber: string;
  isEmployee: boolean;
};

// Define auth context type
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accountNumber: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
};

// Define registration data type
export type RegisterData = {
  fullName: string;
  idNumber: string;
  accountNumber: string;
  password: string;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sample user data (for demo purposes)
const sampleUsers: { [key: string]: User & { password: string } } = {
  '1234567890': {
    id: '1',
    fullName: 'John Doe',
    accountNumber: '1234567890',
    idNumber: 'ID12345678',
    password: 'password123',
    isEmployee: false,
  },
  '0987654321': {
    id: '2',
    fullName: 'Jane Smith',
    accountNumber: '0987654321',
    idNumber: 'ID87654321',
    password: 'password123',
    isEmployee: true,
  },
};

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (accountNumber: string, password: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include CSRF token if needed
          // 'X-CSRF-Token': getCSRFToken(),
        },
        body: JSON.stringify({
          accountNumber: accountNumber,
          password: password,
        }),
        // credentials: 'include' // For cookies if using session-based auth
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      const authenticatedUser = await response.json();
      console.log('Login response:', authenticatedUser);
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // const foundUser = sampleUsers[accountNumber];
      
      // if (!foundUser || foundUser.password !== password) {
      //   throw new Error('Invalid credentials');
      // }
      
      // Create authenticated user (without password)
      // const authenticatedUser = {
      //   id: foundUser.id,
      //   fullName: foundUser.fullName,
      //   accountNumber: foundUser.accountNumber,
      //   idNumber: foundUser.idNumber,
      //   isEmployee: foundUser.isEmployee,
      // };
      
      // Store in state and localStorage
      setUser(authenticatedUser);
      
      // Store in localStorage or sessionStorage based on rememberMe
      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(authenticatedUser));
      } else {
        sessionStorage.setItem('user', JSON.stringify(authenticatedUser));
      }
      
      // Show success message
      toast.success('Login successful');
      
      // Redirect based on user type
      if (authenticatedUser.isEmployee) {
        navigate('/employee-portal');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Check if account number already exists
      if (sampleUsers[userData.accountNumber]) {
        throw new Error('Account already exists');
      }
      
      // Create new user (in a real app, this would be an API call)
      // const newUser = {
      //   id: Date.now().toString(),
      //   fullName: userData.fullName,
      //   accountNumber: userData.accountNumber,
      //   idNumber: userData.idNumber,
      //   password: userData.password,
      //   isEmployee: false,
      // };
      
      // Add to sample users (simulating database)
      // sampleUsers[userData.accountNumber] = newUser;

      // Make API call to Express.js backend
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include CSRF token if needed
          // 'X-CSRF-Token': getCSRFToken(),
        },
        body: JSON.stringify({
          fullName: userData.fullName,
          idNumber: userData.idNumber,
          accountNumber: userData.accountNumber,
          password: userData.password,
        }),
        // credentials: 'include' // For cookies if using session-based auth
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const responseData = await response.json();
      
      toast.success('Registration successful! You can now log in.');
      navigate('/auth?mode=login');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    toast.info('You have been logged out');
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
