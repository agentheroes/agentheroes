'use client';

import React, { CSSProperties } from 'react';

interface CalendarEventProps {
  title: string;
  time: string;
  color: string;
  style: CSSProperties;
}

export function CalendarEvent({ title, time, color, style }: CalendarEventProps) {
  return (
    <div 
      className={`absolute left-1 right-1 rounded-md p-2 shadow-sm border-l-4 overflow-hidden ${color}`}
      style={style}
    >
      <div className="text-xs font-bold text-white truncate">{time}</div>
      <div className="text-sm font-medium text-white truncate">{title}</div>
    </div>
  );
} 