
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { PasswordInput } from './PasswordInput';

interface LoginFormProps {
  accountNumber: string;
  password: string;
  rememberMe: boolean;
  isLoading: boolean;
  errors: Record<string, string>;
  onAccountNumberChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRememberMeChange: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  accountNumber,
  password,
  rememberMe,
  isLoading,
  errors,
  onAccountNumberChange,
  onPasswordChange,
  onRememberMeChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="accountNumber">Account Number</Label>
        <Input 
          id="accountNumber"
          type="text"
          className="input-field"
          placeholder="Enter your account number"
          value={accountNumber}
          onChange={(e) => onAccountNumberChange(e.target.value)}
          disabled={isLoading}
        />
        {errors.accountNumber && (
          <p className="text-red-500 text-sm">{errors.accountNumber}</p>
        )}
      </div>

      <PasswordInput
        value={password}
        onChange={onPasswordChange}
        error={errors.password}
        disabled={isLoading}
        showForgotPassword
      />

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="rememberMe"
          className="rounded border-gray-300 text-navy-600 shadow-sm focus:border-navy-300 focus:ring focus:ring-navy-200 focus:ring-opacity-50"
          checked={rememberMe}
          onChange={(e) => onRememberMeChange(e.target.checked)}
        />
        <Label htmlFor="rememberMe" className="text-sm">Remember me</Label>
      </div>

      <Button 
        type="submit" 
        className="w-full btn-primary"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
            <span>Logging in...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <span>Login</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </div>
        )}
      </Button>
    </form>
  );
};
