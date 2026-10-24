import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  }[size];

  const variantStyles = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm hover:shadow-nexus-glow focus-visible:ring-indigo-500 border border-indigo-500/30',
    secondary: 'bg-nexus-elevated hover:bg-nexus-overlay text-nexus-text border border-nexus-border focus-visible:ring-indigo-500',
    outline: 'bg-transparent hover:bg-nexus-elevated text-nexus-text border border-nexus-border hover:border-nexus-border-bright focus-visible:ring-indigo-500',
    ghost: 'bg-transparent hover:bg-nexus-elevated text-nexus-text-muted hover:text-nexus-text focus-visible:ring-indigo-500',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm focus-visible:ring-rose-500 border border-rose-500/30',
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
