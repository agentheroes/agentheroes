'use client';

import React from 'react';
import { generateTimeSlots, generateWeekDays } from './calendar.utils';
import { CalendarGridProps, Day } from './types';
import { DayView } from './day-view';
import { MonthView } from './month-view';
import { YearView } from './year-view';
import { TimeRow } from './time-row';
import { CurrentTimeIndicator } from './current-time-indicator';

export function CalendarGrid({ currentDate, viewType, events }: CalendarGridProps) {
  // Generate time slots (00:00 AM to 23:00 PM)
  const timeSlots = generateTimeSlots(0, 23);
  
  // Generate week days
  const weekDays = generateWeekDays(currentDate);
  
  // Check if current date is within the week being displayed
  const today = new Date();
  const isCurrentWeek = weekDays.some(day => day.isToday);

  if (viewType === 'Day') {
    return <DayView currentDate={currentDate} timeSlots={timeSlots} events={events} />;
  }

  if (viewType === 'Week') {
    return (
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col h-full">
          {/* Days header row */}
          <div className="flex border-b border-gray-800">
            {/* Empty corner cell */}
            <div className="w-16 flex-shrink-0 border-r border-gray-800 h-14"></div>
            
            {/* Day headers */}
            {weekDays.map((day: Day, index: number) => (
              <div 
                key={index}
                className={`flex-1 min-w-[100px] flex flex-col items-center justify-center border-r border-gray-800 h-14 ${day.isToday ? "bg-gray-800" : ""}`}
              >
                <span className="text-xs font-medium text-gray-400">
                  {day.name.toUpperCase()}
                </span>
                <span
                  className={`text-xl font-bold ${day.isToday ? "text-white" : "text-gray-300"}`}
                >
                  {day.date.getDate()}
                </span>
              </div>
            ))}
          </div>
          
          {/* Time rows */}
          <div className="flex-1 relative">
            {/* Current time indicator - only shown when current week is displayed */}
            {isCurrentWeek && <CurrentTimeIndicator />}
            
            {timeSlots.map((slot: string, index: number) => (
              <TimeRow
                key={index}
                time={slot}
                weekDays={weekDays}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (viewType === 'Month') {
    return <MonthView currentDate={currentDate} events={events} />;
  }

  if (viewType === 'Year') {
    return <YearView currentDate={currentDate} events={events} />;
  }

  return (
    <div className="flex-1 flex items-center justify-center text-gray-400">
      <p>{viewType} view not implemented yet</p>
    </div>
  );
} 