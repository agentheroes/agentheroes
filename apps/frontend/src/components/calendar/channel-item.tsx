'use client';

import React from 'react';
import { ChannelItemProps } from './types';

export function ChannelItem({ name, avatar }: ChannelItemProps) {
  return (
    <div className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-gray-800">
      <div className="flex items-center">
        <div className="w-6 h-6 rounded-md overflow-hidden bg-gray-700 flex-shrink-0">
          <img 
            src={avatar}
            alt={`${name}'s avatar`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback for image load errors
              // (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
            }}
          />
        </div>
        <span className="ml-2 text-sm font-medium">{name}</span>
      </div>
      <button className="text-gray-400 hover:text-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
    </div>
  );
} 