
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { PasswordInput } from './PasswordInput';

interface RegisterFormProps {
  fullName: string;
  idNumber: string;
  accountNumber: string;
  password: string;
  isLoading: boolean;
  errors: Record<string, string>;
  onFullNameChange: (value: string) => void;
  onIdNumberChange: (value: string) => void;
  onAccountNumberChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  fullName,
  idNumber,
  accountNumber,
  password,
  isLoading,
  errors,
  onFullNameChange,
  onIdNumberChange,
  onAccountNumberChange,
  onPasswordChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input 
          id="fullName"
          type="text"
          className="input-field"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(e) => onFullNameChange(e.target.value)}
          disabled={isLoading}
        />
        {errors.fullName && (
          <p className="text-red-500 text-sm">{errors.fullName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="idNumber">ID Number</Label>
        <Input 
          id="idNumber"
          type="text"
          className="input-field"
          placeholder="Enter your ID number"
          value={idNumber}
          onChange={(e) => onIdNumberChange(e.target.value)}
          disabled={isLoading}
        />
        {errors.idNumber && (
          <p className="text-red-500 text-sm">{errors.idNumber}</p>
        )}
      </div>

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
      />

      <Button 
        type="submit" 
        className="w-full btn-primary"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
            <span>Creating account...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <span>Create Account</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </div>
        )}
      </Button>
    </form>
  );
};
