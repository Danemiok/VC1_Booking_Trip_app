import React from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpButtonProps {
  onClick: () => void;
  variant?: 'floating' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const HelpButton: React.FC<HelpButtonProps> = ({ 
  onClick, 
  variant = 'floating', 
  size = 'md',
  className = ''
}) => {
  const baseClasses = 'flex items-center justify-center rounded-full transition-all duration-200';
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };
  
  const variantClasses = {
    floating: 'bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl',
    inline: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
  };
  
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      title="Help Center"
    >
      <HelpCircle className={iconSizes[size]} />
    </button>
  );
};
