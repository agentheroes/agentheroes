'use client';

import React from 'react';
import { CalendarEvent } from './calendar-event';
import { TimeSlot } from './time-slot';
import { Event } from './types';

interface DayViewProps {
  currentDate: Date;
  timeSlots: string[];
  events: Event[];
}

export function DayView({ currentDate, timeSlots, events }: DayViewProps) {
  // Filter events for the current day
  const dayEvents = events.filter(event => 
    event.startTime.getDate() === currentDate.getDate() && 
    event.startTime.getMonth() === currentDate.getMonth() &&
    event.startTime.getFullYear() === currentDate.getFullYear()
  );

  // Function to calculate the position and height of an event
  const getEventPosition = (event: Event) => {
    const startHour = event.startTime.getHours();
    const startMinute = event.startTime.getMinutes();
    const endHour = event.endTime.getHours();
    const endMinute = event.endTime.getMinutes();
    
    // Calculate top position
    const firstSlotHour = parseInt(timeSlots[0].split(':')[0], 10);
    const topPosition = (startHour - firstSlotHour) * 64 + (startMinute / 60) * 64; // 64px is the height of a time slot (h-16)
    
    // Calculate event height
    const durationInHours = (endHour - startHour) + (endMinute - startMinute) / 60;
    const height = durationInHours * 64;
    
    return { top: topPosition, height };
  };

  // Format day name 
  const dayName = currentDate.toLocaleString('default', { weekday: 'short' });
  const isToday = new Date().toDateString() === currentDate.toDateString();

  return (
    <div className="flex-1 overflow-auto">
      <div className="flex h-full">
        {/* Time slots column */}
        <div className="w-16 flex-shrink-0 border-r border-gray-800">
          <div className="h-14 border-b border-gray-800"> {/* Empty header cell */}
          </div>
          <div className="relative">
            {timeSlots.map((slot, index) => (
              <TimeSlot key={index} time={slot} />
            ))}
          </div>
        </div>
        
        {/* Day column */}
        <div className="flex-1 min-w-[200px]">
          {/* Day header */}
          <div className={`h-14 flex flex-col items-center justify-center border-b border-gray-800 ${isToday ? 'bg-gray-800' : ''}`}>
            <span className="text-xs font-medium text-gray-400">{dayName.toUpperCase()}</span>
            <span className={`text-xl font-bold ${isToday ? 'text-white' : 'text-gray-300'}`}>
              {currentDate.getDate()}
            </span>
          </div>
          
          {/* Time grid */}
          <div className="relative">
            {/* Render time slot backgrounds */}
            {timeSlots.map((_, index) => (
              <div key={index} className="h-16 border-b border-gray-800"></div>
            ))}
            
            {/* Render events */}
            {dayEvents.map(event => {
              const { top, height } = getEventPosition(event);
              return (
                <CalendarEvent 
                  key={event.id}
                  title={event.title}
                  time={`${event.startTime.getHours()}:${event.startTime.getMinutes().toString().padStart(2, '0')} ${event.startTime.getHours() >= 12 ? 'PM' : 'AM'}`}
                  color={event.color}
                  style={{ top: `${top}px`, height: `${height}px` }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 