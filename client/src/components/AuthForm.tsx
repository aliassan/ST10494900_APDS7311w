import React, { useState } from 'react';
import { useAuth, RegisterData } from '@/context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { LoginForm } from './auth/LoginForm';
import { RegisterForm } from './auth/RegisterForm';

type AuthFormProps = {
  defaultMode?: 'login' | 'register';
};

// Password requirements configuration
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

const AuthForm: React.FC<AuthFormProps> = ({ defaultMode = 'login' }) => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') as 'login' | 'register' || defaultMode;
  
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Form states
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [rememberMe, setRememberMe] = useState(false);
  
  // Input sanitization function (Step 7)
  const sanitizeInput = (input: string): string => {
    // Trim whitespace
    let sanitized = input.trim();
    
    // Remove potentially malicious content using DOMPurify
    sanitized = DOMPurify.sanitize(sanitized, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [], // No attributes allowed
    });
    
    return sanitized;
  };

  // Password validation function (Step 6)
  const validatePassword = (password: string): string | null => {
    // Skip validation if empty (handled by required validation)
    if (!password) return null;
    
    // Check minimum length
    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
      return `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`;
    }

    // Check for uppercase
    if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }

    // Check for lowercase
    if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }

    // Check for number
    if (PASSWORD_REQUIREMENTS.requireNumber && !/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }

    // Check for special character
    if (PASSWORD_REQUIREMENTS.requireSpecialChar && !/[^A-Za-z0-9]/.test(password)) {
      return 'Password must contain at least one special character';
    }

    return null;
  };

  // Field format validation
  const validateFieldFormat = (field: string, value: string): string | null => {
    switch (field) {
      case 'accountNumber':
        if (!/^\d{10}$/.test(value)) {
          return 'Account number must be 10 digits';
        }
        break;
      case 'idNumber':
        if (!/^[A-Za-z0-9]{8,20}$/.test(value)) {
          return 'ID number must be 8-20 alphanumeric characters';
        }
        break;
      case 'fullName':
        if (!/^[a-zA-Z\s'-]{2,50}$/.test(value)) {
          return 'Please enter a valid full name (2-50 letters)';
        }
        break;
    }
    return null;
  };

  // Main validation function
  const validate = () => {
    const errors: Record<string, string> = {};
    
    // Sanitize inputs first
    const sanitizedAccountNumber = sanitizeInput(accountNumber);
    const sanitizedPassword = sanitizeInput(password);
    const sanitizedFullName = mode === 'register' ? sanitizeInput(fullName) : '';
    const sanitizedIdNumber = mode === 'register' ? sanitizeInput(idNumber) : '';

    // Required field validation
    if (!sanitizedAccountNumber) errors.accountNumber = 'Account number is required';
    if (!sanitizedPassword) errors.password = 'Password is required';
    
    if (mode === 'register') {
      if (!sanitizedFullName) errors.fullName = 'Full name is required';
      if (!sanitizedIdNumber) errors.idNumber = 'ID number is required';
    }

    // Field format validation
    if (sanitizedAccountNumber) {
      const accountNumberError = validateFieldFormat('accountNumber', sanitizedAccountNumber);
      if (accountNumberError) errors.accountNumber = accountNumberError;
    }

    if (mode === 'register' && sanitizedIdNumber) {
      const idNumberError = validateFieldFormat('idNumber', sanitizedIdNumber);
      if (idNumberError) errors.idNumber = idNumberError;
    }

    if (mode === 'register' && sanitizedFullName) {
      const fullNameError = validateFieldFormat('fullName', sanitizedFullName);
      if (fullNameError) errors.fullName = fullNameError;
    }

    // Password complexity validation
    if (sanitizedPassword) {
      const passwordError = validatePassword(sanitizedPassword);
      if (passwordError) errors.password = passwordError;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    // Use sanitized values for submission
    const sanitizedAccountNumber = sanitizeInput(accountNumber);
    const sanitizedPassword = sanitizeInput(password);
    
    if (mode === 'login') {
      await login(sanitizedAccountNumber, sanitizedPassword, rememberMe);
    } else {
      const sanitizedFullName = sanitizeInput(fullName);
      const sanitizedIdNumber = sanitizeInput(idNumber);
      
      const userData: RegisterData = {
        fullName: sanitizedFullName,
        idNumber: sanitizedIdNumber,
        accountNumber: sanitizedAccountNumber,
        password: sanitizedPassword,
      };
      await register(userData);
    }
  };
  
  // Handle input changes with sanitization
  const handleAccountNumberChange = (value: string) => {
    setAccountNumber(sanitizeInput(value));
  };
  
  const handlePasswordChange = (value: string) => {
    setPassword(value); // Don't sanitize password to preserve special chars
  };
  
  const handleFullNameChange = (value: string) => {
    setFullName(sanitizeInput(value));
  };
  
  const handleIdNumberChange = (value: string) => {
    setIdNumber(sanitizeInput(value));
  };
  
  // Toggle between login and register
  const toggleMode = () => {
    navigate(`/auth?mode=${mode === 'login' ? 'register' : 'login'}`);
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="glass-panel shadow-glass-lg border border-white/30">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold text-center">
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </CardTitle>
          <CardDescription className="text-center">
            {mode === 'login' 
              ? 'Enter your credentials to access your account' 
              : 'Fill out the form below to create your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === 'login' ? (
            <LoginForm
              accountNumber={accountNumber}
              password={password}
              rememberMe={rememberMe}
              isLoading={isLoading}
              errors={formErrors}
              onAccountNumberChange={handleAccountNumberChange}
              onPasswordChange={handlePasswordChange}
              onRememberMeChange={setRememberMe}
              onSubmit={handleSubmit}
            />
          ) : (
            <RegisterForm
              fullName={fullName}
              idNumber={idNumber}
              accountNumber={accountNumber}
              password={password}
              isLoading={isLoading}
              errors={formErrors}
              onFullNameChange={handleFullNameChange}
              onIdNumberChange={handleIdNumberChange}
              onAccountNumberChange={handleAccountNumberChange}
              onPasswordChange={handlePasswordChange}
              onSubmit={handleSubmit}
            />
          )}
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-center mt-2">
            <p className="text-sm text-gray-600">
              {mode === 'login' ? 'Don\'t have an account?' : 'Already have an account?'}
              <button
                type="button"
                className="ml-1 text-navy-500 hover:underline font-medium"
                onClick={toggleMode}
              >
                {mode === 'login' ? 'Register' : 'Login'}
              </button>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthForm;