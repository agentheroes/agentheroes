'use client';

import React from 'react';
import { Day } from './types';
import { SlotComponent } from '@frontend/components/calendar/slot.component';
import dayjs from 'dayjs';

interface TimeRowProps {
  time: string;
  weekDays: Day[];
}

export function TimeRow({ time, weekDays }: TimeRowProps) {
  return (
    <div className="flex min-h-16 border-b border-gray-800">
      {/* Time label */}
      <div className="w-16 flex-shrink-0 flex items-start justify-end pr-2 text-xs text-gray-400 border-r border-gray-800">
        <span className="relative -top-2">{time}</span>
      </div>
      
      {/* Day slots */}
      {weekDays.map((day, index) => (
        <div 
          key={index} 
          className={`flex-1 min-w-[100px] border-r border-gray-800 relative ${day.isToday ? "bg-gray-900" : ""}`}
        >
          <SlotComponent
            date={dayjs(dayjs(day.date).format("YYYY-MM-DD") + "T" + time)}
          />
        </div>
      ))}
    </div>
  );
} 