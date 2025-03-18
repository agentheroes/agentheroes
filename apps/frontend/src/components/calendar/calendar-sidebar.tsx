'use client';

import React, { useMemo } from 'react';
import { ChannelItem } from './channel-item';

export function CalendarSidebar() {
  // Move mock channel data inside the component and memoize it
  const mockChannels = useMemo(() => [
    { id: '1', name: 'SushiPro', avatar: '/avatar-placeholder.png' },
    { id: '2', name: 'SushiPro', avatar: '/avatar-placeholder.png' },
    { id: '3', name: 'SushiPro', avatar: '/avatar-placeholder.png' },
    { id: '4', name: 'SushiPro', avatar: '/avatar-placeholder.png' },
    { id: '5', name: 'SushiPro', avatar: '/avatar-placeholder.png' },
    { id: '6', name: 'SushiPro', avatar: '/avatar-placeholder.png' },
  ], []);

  return (
    <div className="w-60 h-full bg-black flex flex-col">
      <div className="mb-4">
        <h3 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
          YOUR CHANNELS
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1">
        {mockChannels.map((channel) => (
          <ChannelItem 
            key={channel.id}
            name={channel.name}
            avatar={channel.avatar}
          />
        ))}
      </div>
      <div className="mt-4">
        <button className="flex items-center justify-center w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add post
        </button>
      </div>
    </div>
  );
} 