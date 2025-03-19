'use client';

import React from 'react';
import { SocialMedia } from '../calendar/social.media.context';

interface SelectableChannelItemProps {
  channel: SocialMedia;
  isSelected: boolean;
  onToggle: (channelId: string) => void;
}

export function SelectableChannelItem({ 
  channel, 
  isSelected, 
  onToggle 
}: SelectableChannelItemProps) {
  const { id, name, profilePic, identifier } = channel;
  const socialIconUrl = `/socials/${identifier}.png`;

  return (
    <div 
      onClick={() => onToggle(id)}
      className={`flex items-center rounded-md transition-all cursor-pointer ${
        isSelected 
          ? '' 
          : 'opacity-50'
      }`}
    >
      <div className="w-8 h-8 rounded-full flex-shrink-0 relative">
        {/* Profile Picture */}
        <img 
          src={profilePic}
          alt={`${name}'s profile picture`}
          className="w-full h-full bg-cover rounded-full"
          onError={(e) => {
            // Fallback for image load errors
            (e.target as HTMLImageElement).src = '/social-placeholder.png';
          }}
        />
        
        {/* Social Media Icon Overlay */}
        <div className="absolute bottom-[-2px] right-[-2px] w-4 h-4 rounded-full overflow-hidden">
          <img 
            src={socialIconUrl}
            alt={`${identifier} icon`}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/social-placeholder.png';
            }}
          />
        </div>
      </div>
    </div>
  );
} 