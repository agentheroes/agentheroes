"use client";

import { FC, ReactNode } from 'react';

interface NodeButtonProps {
  onClick: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const NodeButton: FC<NodeButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary' 
}) => {
  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white';
      case 'secondary':
        return 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-800';
      case 'ghost':
        return 'bg-transparent hover:bg-gray-100 text-gray-700';
      default:
        return 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${getButtonStyles()}`}
    >
      {children}
    </button>
  );
}; 