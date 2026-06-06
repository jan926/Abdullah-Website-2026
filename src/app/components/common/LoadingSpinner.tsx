// LoadingSpinner Component
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

/**
 * LoadingSpinner Component
 * Reusable loading indicator with optional text
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Loading...',
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-purple to-neon-cyan opacity-75 blur-md"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-neon-purple border-r-neon-cyan animate-spin"></div>
      </div>
      {text && <p className="text-text-secondary text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-bg-primary/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinnerContent}
      </div>
    );
  }

  return <div className="flex items-center justify-center">{spinnerContent}</div>;
};
