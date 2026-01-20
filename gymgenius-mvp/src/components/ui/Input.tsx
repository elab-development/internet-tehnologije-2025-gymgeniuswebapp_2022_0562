'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  type?: InputType;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Reusable Input komponenta sa validacijom i error handling-om
 * 
 * @example
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   error={errors.email}
 *   onChange={handleChange}
 * />
 */
export default function Input({
  label,
  type = 'text',
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Određivanje tipa inputa (za password toggle)
  const inputType = type === 'password' && showPassword ? 'text' : type;

  // Base stilovi
  const baseStyles = 'px-4 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2';

  // State stilovi
  const stateStyles = error
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
    : isFocused
    ? 'border-primary-500 focus:ring-primary-500'
    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500';

  // Icon padding
  const paddingStyles = leftIcon ? 'pl-10' : rightIcon || type === 'password' ? 'pr-10' : '';

  // Width stilovi
  const widthStyles = fullWidth ? 'w-full' : '';

  // Kombinuj stilove
  const inputStyles = `${baseStyles} ${stateStyles} ${paddingStyles} ${widthStyles} ${className}`;

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}

        {/* Input field */}
        <input
          type={inputType}
          className={inputStyles}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* Right icon ili password toggle */}
        {type === 'password' ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        ) : rightIcon ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        ) : null}
      </div>

      {/* Error ili helper text */}
      {error && (
        <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {!error && helperText && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}