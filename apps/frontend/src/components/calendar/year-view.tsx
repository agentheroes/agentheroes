'use client';

import React, { useMemo } from 'react';
import { Event } from './types';
import dayjs from 'dayjs';

interface YearViewProps {
  currentDate: Date;
  events: Event[];
}

export function YearView({ currentDate, events }: YearViewProps) {
  // Group events by month and day
  const eventsByMonthAndDay = useMemo(() => {
    const result: Record<number, Record<number, number>> = {};
    
    // Initialize result with empty months
    for (let i = 0; i < 12; i++) {
      result[i] = {};
    }
    
    // Count events per day
    events.forEach(event => {
      // Parse the date string to get a Date object
      const eventDate = dayjs(event.date).toDate();
      
      if (eventDate.getFullYear() === currentDate.getFullYear()) {
        const month = eventDate.getMonth();
        const day = eventDate.getDate();
        
        if (!result[month][day]) {
          result[month][day] = 0;
        }
        
        result[month][day]++;
      }
    });
    
    return result;
  }, [events, currentDate]);
  
  // Get current month and today's day
  const currentMonth = new Date().getMonth();
  const currentDay = new Date().getDate();
  const isCurrentYear = new Date().getFullYear() === currentDate.getFullYear();

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
        {Array.from({ length: 12 }, (_, monthIndex) => {
          // Calculate days in month
          const daysInMonth = new Date(
            currentDate.getFullYear(),
            monthIndex + 1,
            0
          ).getDate();
          
          // Calculate first day of month
          const firstDayOfMonth = new Date(
            currentDate.getFullYear(),
            monthIndex,
            1
          ).getDay();
          
          // Convert Sunday (0) to 6 and others to day-1 so Monday is 0, Tuesday is 1, etc.
          const firstDayOfMonthMondayBased = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
          
          // Create array for days in the month
          const days = [];
          
          // Add empty cells for days before the first of the month (using Monday as first day)
          for (let i = 0; i < firstDayOfMonthMondayBased; i++) {
            days.push(null);
          }
          
          // Add the days of the month
          for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
          }
          
          // Calculate if this is the current month
          const isCurrentMonthAndYear = isCurrentYear && monthIndex === currentMonth;
          
          return (
            <div key={monthIndex} className="border border-gray-800 rounded">
              {/* Month header */}
              <div className="text-center text-sm font-medium text-gray-300 py-2 border-b border-gray-800 bg-gray-900">
                {monthNames[monthIndex]}
              </div>
              
              {/* Days of week header */}
              <div className="grid grid-cols-7 text-center text-[0.6rem] text-gray-500 py-1">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                  <div key={index}>{day}</div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-0 p-1">
                {days.map((day, index) => {
                  // Check if this day has events
                  const hasEvents = day !== null && eventsByMonthAndDay[monthIndex][day] > 0;
                  
                  // Check if this is today
                  const isToday = isCurrentMonthAndYear && day === currentDay;
                  
                  return (
                    <div 
                      key={index}
                      className={`
                        aspect-square flex items-center justify-center text-[0.65rem]
                        ${day === null ? '' : 'rounded-full'}
                        ${isToday ? 'bg-orange-500 text-white' : 'text-gray-400'}
                        ${!isToday && hasEvents ? 'relative' : ''}
                      `}
                    >
                      {day !== null && (
                        <>
                          {day}
                          {/* Event indicator dot */}
                          {hasEvents && !isToday && (
                            <div className="absolute bottom-0 h-1 w-1 bg-blue-500 rounded-full"></div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 