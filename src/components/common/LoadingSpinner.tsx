import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label = 'লোড হচ্ছে...',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 space-y-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} text-brand border-current border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="loading"
      />
      {label && <span className="text-sm font-medium text-ink-2">{label}</span>}
    </div>
  );
};

export default LoadingSpinner;
