'use client';

import React from 'react';
import { CalendarHeaderProps } from './types';

export function CalendarHeader({
  currentDate,
  viewType,
  onPrevious,
  onNext,
  onToday,
  onViewChange,
}: CalendarHeaderProps) {
  const getHeaderText = () => {
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    
    if (viewType === 'Day') {
      return `${month} ${currentDate.getDate()}, ${year}`;
    } else if (viewType === 'Week') {
      // For week view, show the date range
      const weekStart = new Date(currentDate);
      const day = currentDate.getDay();
      const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust for starting week on Monday
      weekStart.setDate(diff);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const startMonth = weekStart.toLocaleString('default', { month: 'short' });
      const endMonth = weekEnd.toLocaleString('default', { month: 'short' });
      
      return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}, ${year}`;
    } else if (viewType === 'Month') {
      return `${month} ${year}`;
    } else {
      return `${year}`;
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between py-4 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <button 
            onClick={onPrevious}
            className="p-2 rounded-md hover:bg-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={onToday}
            className="px-4 py-2 text-sm rounded-md bg-gray-800 hover:bg-gray-700"
          >
            Today
          </button>
          <button 
            onClick={onNext}
            className="p-2 rounded-md hover:bg-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <h2 className="ml-4 text-xl font-semibold">{getHeaderText()}</h2>
        </div>
        <div className="flex items-center">
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <button 
              onClick={() => onViewChange('Day')}
              className={`px-4 py-2 text-sm ${viewType === 'Day' ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
            >
              Day
            </button>
            <button 
              onClick={() => onViewChange('Week')}
              className={`px-4 py-2 text-sm ${viewType === 'Week' ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
            >
              Week
            </button>
            <button 
              onClick={() => onViewChange('Month')}
              className={`px-4 py-2 text-sm ${viewType === 'Month' ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
            >
              Month
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 