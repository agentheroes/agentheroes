'use client';

import React, { useState } from 'react';
import { ChannelItem } from './channel-item';
import { useSocialMedia } from './social.media.context';
import { AddChannelPopup } from './add-channel-popup';

export function CalendarSidebar() {
  const { socials, loading, error } = useSocialMedia();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [isAddChannelPopupOpen, setIsAddChannelPopupOpen] = useState(false);

  const handleAddChannelClick = () => {
    setIsAddChannelPopupOpen(true);
  };

  const handleCloseAddChannelPopup = () => {
    setIsAddChannelPopupOpen(false);
  };

  return (
    <div className="w-60 h-full bg-black flex flex-col">
      <div className="mb-4">
        <h3 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
          YOUR CHANNELS
        </h3>
      </div>
      
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-orange-500"></div>
          <span className="ml-2 text-xs text-gray-400">Loading channels...</span>
        </div>
      )}
      
      {error && (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-xs text-red-500">{error}</span>
        </div>
      )}
      
      {!loading && !error && (
        <div className="overflow-y-auto space-y-1">
          {socials.length === 0 ? (
            <div className="text-gray-400 py-4">
              <span className="text-xs">No channels connected</span>
            </div>
          ) : (
            socials.map((social) => (
              <ChannelItem 
                key={social.id}
                id={social.id}
                name={social.name}
                profilePic={social.profilePic}
                identifier={social.identifier}
                isSelected={social.id === selectedChannelId}
              />
            ))
          )}
        </div>
      )}
      
      <div className="mt-4">
        <button 
          className="flex items-center justify-center w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors"
          onClick={handleAddChannelClick}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Channel
        </button>
      </div>
      
      {/* Add Channel Popup */}
      <AddChannelPopup 
        isOpen={isAddChannelPopupOpen} 
        onClose={handleCloseAddChannelPopup} 
      />
    </div>
  );
} 