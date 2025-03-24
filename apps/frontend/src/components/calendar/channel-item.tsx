'use client';

import React from 'react';
import { ChannelItemProps } from './types';

export function ChannelItem({ id, name, profilePic, identifier, isSelected = false }: ChannelItemProps) {
  const socialIconUrl = `/socials/${identifier}.png`;

  return (
    <div 
      className={`flex items-center justify-between py-2 px-2 rounded-md transition-colors ${
        isSelected ? 'bg-gray-800' : 'hover:bg-gray-800'
      }`}
    >
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full flex-shrink-0 relative">
          {/* Profile Picture */}
          <img 
            src={profilePic}
            alt={`${name}'s profile picture`}
            className="w-full h-full bg-cover rounded-full"
            onError={(e) => {
              // Fallback for image load errors
            }}
          />
          
          {/* Social Media Icon Overlay */}
          <div className="absolute bottom-[-2px] right-[-2px] w-4 h-4 rounded-full overflow-hidden border border-gray-800">
            <img 
              src={socialIconUrl}
              alt={`${identifier} icon`}
              className="w-full h-full object-cover border border-blue-950"
              onError={(e) => {
                // Fallback for social icon load errors
                // (e.target as HTMLImageElement).src = '/social-placeholder.png';
              }}
            />
          </div>
        </div>
        <span className="ml-2 text-sm font-medium">{name}</span>
      </div>
      {/*<button className="text-gray-400 hover:text-gray-300">*/}
      {/*  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">*/}
      {/*    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />*/}
      {/*  </svg>*/}
      {/*</button>*/}
    </div>
  );
} 