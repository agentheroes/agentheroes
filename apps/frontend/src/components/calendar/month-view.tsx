'use client';

import React, { useMemo } from 'react';
import { Event } from './types';

interface MonthViewProps {
  currentDate: Date;
  events: Event[];
}

export function MonthView({ currentDate, events }: MonthViewProps) {
  // Get the number of days in the month
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  // Get the first day of the month
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  // Create an array of day numbers for the current month
  const days = useMemo(() => {
    const result = [];
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      result.push(null);
    }
    
    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      result.push(i);
    }
    
    return result;
  }, [daysInMonth, firstDayOfMonth]);

  // Group events by day
  const eventsByDay = useMemo(() => {
    const result: Record<number, Event[]> = {};
    
    events.forEach(event => {
      if (
        event.startTime.getMonth() === currentDate.getMonth() &&
        event.startTime.getFullYear() === currentDate.getFullYear()
      ) {
        const day = event.startTime.getDate();
        if (!result[day]) {
          result[day] = [];
        }
        result[day].push(event);
      }
    });
    
    return result;
  }, [events, currentDate]);

  // Check if a day is today
  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      {/* Days of week header */}
      <div className="grid grid-cols-7 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div 
            key={index}
            className="text-center text-xs font-medium text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div 
            key={index}
            className={`
              border border-gray-800 min-h-[100px] p-1 relative
              ${day === null ? 'bg-gray-950 opacity-30' : ''}
              ${isToday(day as number) ? 'bg-gray-800' : ''}
            `}
          >
            {day !== null && (
              <>
                <span className={`text-sm font-medium ${isToday(day) ? 'text-white' : 'text-gray-400'}`}>
                  {day}
                </span>
                
                {/* Show events for this day */}
                <div className="mt-1 space-y-1">
                  {eventsByDay[day] && eventsByDay[day].slice(0, 3).map((event, eventIndex) => (
                    <div 
                      key={eventIndex}
                      className={`text-xs truncate p-1 rounded ${event.color.replace('border-', '')}`}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  
                  {/* Show "more" indicator if there are more events */}
                  {eventsByDay[day] && eventsByDay[day].length > 3 && (
                    <div className="text-xs text-gray-400 pl-1">
                      +{eventsByDay[day].length - 3} more
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 