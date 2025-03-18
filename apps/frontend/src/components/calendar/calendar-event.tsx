'use client';

import React, { CSSProperties } from 'react';

interface CalendarEventProps {
  title: string;
  time: string;
}

export function CalendarEvent({ title, time }: CalendarEventProps) {
  return (
    <div
      className={`rounded-md p-2 shadow-btn border-l-4 bg-[#FD7302]`}
    >
      <div className="text-xs font-bold text-white truncate">{time}</div>
      <div className="text-sm font-medium text-white truncate">{title}</div>
    </div>
  );
} 