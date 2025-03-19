'use client';

import React from 'react';
import {SocialMedia} from "@frontend/components/calendar/SocialMediaContext";

interface CalendarEventProps {
  title: string;
  time: string;
  channel: SocialMedia;
  type: string;
}

export function CalendarEvent({ title, time, channel, type }: CalendarEventProps) {
  const socialIconUrl = `/socials/${channel.identifier}.png`;

  return (
    <div
      className={`rounded-md p-1 shadow-btn border-l-4 bg-[#FD7302] flex items-center max-w-full overflow-hidden`}
    >
      <div className="w-6 h-6 rounded-full flex-shrink-0 relative mr-2">
        {/* Profile Picture */}
        <img 
          src={channel.profilePic}
          alt={`${channel.name}'s profile picture`}
          className="w-full h-full bg-cover rounded-full"
          onError={(e) => {
            // Fallback for image load errors
          }}
        />
        
        {/* Social Media Icon Overlay */}
        <div className="absolute bottom-[-2px] right-[-2px] w-3 h-3 rounded-full overflow-hidden border border-gray-800">
          <img 
            src={socialIconUrl}
            alt={`${channel.identifier} icon`}
            className="w-full h-full object-cover border border-blue-950"
            onError={(e) => {
              // Fallback for social icon load errors
            }}
          />
        </div>
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="text-xs font-bold text-white truncate">{time}</div>
        <div className="text-xs font-medium text-white truncate">{type === 'draft' ? 'draft: ' : ''}{title}</div>
      </div>
    </div>
  );
} 