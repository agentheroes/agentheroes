'use client';

import React from 'react';
import { DayColumn } from './day-column';
import { TimeSlot } from './time-slot';
import { generateTimeSlots, generateWeekDays } from './calendarUtils';
import { CalendarGridProps, Day } from './types';
import { DayView } from './day-view';
import { MonthView } from './month-view';
import { YearView } from './year-view';

export function CalendarGrid({ currentDate, viewType, events }: CalendarGridProps) {
  // Generate time slots (7 AM to 7 PM)
  const timeSlots = generateTimeSlots(7, 19);
  
  // Generate week days
  const weekDays = generateWeekDays(currentDate);

  if (viewType === 'Day') {
    return <DayView currentDate={currentDate} timeSlots={timeSlots} events={events} />;
  }

  if (viewType === 'Week') {
    return (
      <div className="flex-1 overflow-auto">
        <div className="flex h-full">
          {/* Time slots column */}
          <div className="w-16 flex-shrink-0 border-r border-gray-800">
            <div className="h-14 border-b border-gray-800"> {/* Empty header cell */}
            </div>
            <div className="relative">
              {timeSlots.map((slot: string, index: number) => (
                <TimeSlot key={index} time={slot} />
              ))}
            </div>
          </div>
          
          {/* Days columns */}
          <div className="flex-1 flex">
            {weekDays.map((day: Day, index: number) => (
              <DayColumn 
                key={index}
                day={day}
                timeSlots={timeSlots}
                events={events.filter(event => 
                  event.startTime.getDate() === day.date.getDate() && 
                  event.startTime.getMonth() === day.date.getMonth() &&
                  event.startTime.getFullYear() === day.date.getFullYear()
                )}
                isToday={day.isToday}
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