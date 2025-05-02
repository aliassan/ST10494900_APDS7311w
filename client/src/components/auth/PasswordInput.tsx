
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  showForgotPassword?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  error,
  disabled,
  showForgotPassword = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="password">Password</Label>
        {showForgotPassword && (
          <a 
            href="#" 
            className="text-sm text-navy-500 hover:underline"
            onClick={(e) => {
              e.preventDefault();
              alert('Password reset functionality would be implemented here');
            }}
          >
            Forgot password?
          </a>
        )}
      </div>
      <div className="relative">
        <Input 
          id="password"
          type={showPassword ? 'text' : 'password'}
          className="input-field pr-10"
          placeholder="Enter your password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};
