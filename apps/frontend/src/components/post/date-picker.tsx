"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@frontend/components/ui/button";
import { Input } from "@frontend/components/ui/input";
import { Label } from "@frontend/components/ui/label";
import dayjs from "dayjs";

interface DatePickerProps {
  selectedDate: Date | undefined;
  onChange: (date: Date) => void;
  minDate?: Date;
}

export function DatePicker({ selectedDate, onChange, minDate = new Date() }: DatePickerProps) {
  const [year, setYear] = useState<number>(selectedDate?.getFullYear() || new Date().getFullYear());
  const [month, setMonth] = useState<number>(selectedDate?.getMonth() || new Date().getMonth());
  const [day, setDay] = useState<number>(selectedDate?.getDate() || new Date().getDate());
  const [hour, setHour] = useState<number>(selectedDate?.getHours() || new Date().getHours());
  const [minute, setMinute] = useState<number>(selectedDate?.getMinutes() || new Date().getMinutes());
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Format minimum date to avoid time comparisons
  const formattedMinDate = dayjs(minDate).startOf('day');

  // Update the date components when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setYear(selectedDate.getFullYear());
      setMonth(selectedDate.getMonth());
      setDay(selectedDate.getDate());
      setHour(selectedDate.getHours());
      setMinute(selectedDate.getMinutes());
    }
  }, [selectedDate]);

  // Get the number of days in the selected month/year
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get the day of week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Check if a date is in the past
  const isDateInPast = (year: number, month: number, day: number) => {
    const date = dayjs(new Date(year, month, day)).startOf('day');
    return date.isBefore(formattedMinDate);
  };

  // Create calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    
    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected = i === day && month === selectedDate?.getMonth() && year === selectedDate?.getFullYear();
      const isPast = isDateInPast(year, month, i);
      
      days.push(
        <button
          key={i}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm
            ${isSelected ? 'bg-primary text-primary-foreground' : ''}
            ${isPast ? 'text-gray-500 cursor-not-allowed' : 'hover:bg-gray-700'}`}
          onClick={() => {
            if (!isPast) {
              setDay(i);
              updateDate(year, month, i, hour, minute);
            }
          }}
          disabled={isPast}
        >
          {i}
        </button>
      );
    }
    
    return days;
  };

  // When any component of the date changes, update the full date
  const updateDate = (
    newYear: number,
    newMonth: number,
    newDay: number,
    newHour: number,
    newMinute: number
  ) => {
    // Ensure we don't set a day that doesn't exist in the month
    const daysInMonth = getDaysInMonth(newYear, newMonth);
    const adjustedDay = Math.min(newDay, daysInMonth);
    
    // Create the new date
    const newDate = new Date(newYear, newMonth, adjustedDay, newHour, newMinute);
    
    // Check if this date is in the past
    if (dayjs(newDate).isBefore(dayjs(minDate))) {
      // If it's in the past, use the current date/time instead
      onChange(new Date());
    } else {
      onChange(newDate);
    }
  };

  // Handle month navigation
  const goToPreviousMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  // Check if previous month button should be disabled
  const isPreviousMonthDisabled = () => {
    if (year < formattedMinDate.year()) return true;
    if (year === formattedMinDate.year() && month <= formattedMinDate.month()) return true;
    return false;
  };

  // Format the displayed date
  const formatDisplayDate = () => {
    if (!selectedDate) return "Select a date and time";
    return dayjs(selectedDate).format("MMM D, YYYY h:mm A");
  };

  return (
    <div className="relative">
      <div className="flex flex-col space-y-2">
        <div
          className="flex items-center justify-between border rounded-md p-2 cursor-pointer"
          onClick={() => setCalendarOpen(!calendarOpen)}
        >
          <span>{formatDisplayDate()}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>

        {calendarOpen && (
          <div className="absolute z-10 mt-1 p-3 bg-background border rounded-md shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <button 
                onClick={goToPreviousMonth}
                disabled={isPreviousMonthDisabled()}
                className="p-1 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <span className="font-medium">
                {new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button 
                onClick={goToNextMonth}
                className="p-1 rounded hover:bg-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="h-8 w-8 flex items-center justify-center text-xs text-gray-400">
                  {day}
                </div>
              ))}
              {generateCalendarDays()}
            </div>

            <div className="flex space-x-2 mt-3">
              <div>
                <Label htmlFor="hour" className="text-xs block mb-1">Hour</Label>
                <Input
                  id="hour"
                  type="number"
                  min={0}
                  max={23}
                  value={hour}
                  onChange={(e) => {
                    const newHour = Math.max(0, Math.min(23, parseInt(e.target.value) || 0));
                    setHour(newHour);
                    updateDate(year, month, day, newHour, minute);
                  }}
                  className="w-16 h-8 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="minute" className="text-xs block mb-1">Minute</Label>
                <Input
                  id="minute"
                  type="number"
                  min={0}
                  max={59}
                  value={minute}
                  onChange={(e) => {
                    const newMinute = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                    setMinute(newMinute);
                    updateDate(year, month, day, hour, newMinute);
                  }}
                  className="w-16 h-8 text-xs"
                />
              </div>

              <div className="flex items-end">
                <Button
                  size="sm"
                  onClick={() => setCalendarOpen(false)}
                  className="ml-auto"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 