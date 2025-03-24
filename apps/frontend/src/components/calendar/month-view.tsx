"use client";

import React, { useMemo } from "react";
import { Event } from "./types";
import { SlotComponent } from "@frontend/components/calendar/slot.component";
import dayjs from "dayjs";

interface MonthViewProps {
  currentDate: Date;
  events: Event[];
}

export function MonthView({ currentDate, events }: MonthViewProps) {
  // Get the number of days in the month
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();

  // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonthSundayBased = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();
  
  // Convert to Monday-based (0 = Monday, 1 = Tuesday, ..., 6 = Sunday)
  const firstDayOfMonth = firstDayOfMonthSundayBased === 0 ? 6 : firstDayOfMonthSundayBased - 1;

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
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
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
              ${day === null ? "bg-gray-950 opacity-30" : ""}
              ${isToday(day as number) ? "bg-gray-800" : ""}
            `}
          >
            {day !== null && (
              <>
                <span
                  className={`text-sm font-medium ${isToday(day) ? "text-white" : "text-gray-400"}`}
                >
                  {day}
                </span>
                <div>
                  <SlotComponent
                    view="month"
                    date={dayjs(
                      dayjs(
                        currentDate
                          .toISOString()
                          .split("-")
                          .slice(0, 2)
                          .join("-") +
                          "-" +
                          day,
                      ).format("YYYY-MM-DD") +
                        "T" +
                        dayjs().add(10, "minutes").format("HH:mm:ss"),
                    )}
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
