"use client";

import React, { useState } from "react";
import { SocialMedia } from "@frontend/components/calendar/social.media.context";
import dayjs from "dayjs";
import { PostDialog } from "@frontend/components/post/post-dialog";
import { useDrag } from "react-dnd";

interface CalendarEventProps {
  title: string;
  time: string;
  channel: SocialMedia;
  type: string;
  group: string;
  date: dayjs.Dayjs;
}

export function CalendarEvent({
  title,
  time,
  channel,
  type,
  group,
  date,
}: CalendarEventProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "event",
    item: { group },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  const socialIconUrl = `/socials/${channel.identifier}.png`;

  const handleEventClick = () => {
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <div
        className={`rounded-md p-1 shadow-btn border-l-4 bg-[#FD7302] flex items-center max-w-full overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative z-[2]`}
        onClick={handleEventClick}
        ref={drag as any}
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
          <div className="text-xs font-medium text-white truncate">
            {type === "draft" ? "draft: " : ""}
            {title}
          </div>
        </div>
      </div>

      {/* Post Edit Dialog */}
      <PostDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        date={date.toDate()}
        isEditing={true}
        groupId={group}
        channelId={channel.id}
      />
    </>
  );
}
