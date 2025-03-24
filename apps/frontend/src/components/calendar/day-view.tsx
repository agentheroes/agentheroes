"use client";

import React from "react";
import { TimeSlot } from "./time-slot";
import { Event } from "./types";
import { SlotComponent } from "@frontend/components/calendar/slot.component";
import dayjs from "dayjs";
import {convertToTime} from "@frontend/components/calendar/time-row";
import { CurrentTimeIndicator } from "./current-time-indicator";

interface DayViewProps {
  currentDate: Date;
  timeSlots: string[];
  events: Event[];
}

export function DayView({ currentDate, timeSlots, events }: DayViewProps) {
  // Format day name
  const dayName = currentDate.toLocaleString("default", { weekday: "short" });
  const isToday = new Date().toDateString() === currentDate.toDateString();

  return (
    <div className="flex-1 overflow-auto">
      <div className="flex flex-col h-full">
        {/* Day header */}
        <div className="flex border-b border-gray-800">
          {/* Empty corner cell */}
          <div className="w-16 flex-shrink-0 border-r border-gray-800 h-14"></div>

          {/* Day header */}
          <div
            className={`flex-1 min-w-[200px] flex flex-col items-center justify-center border-r border-gray-800 h-14 ${isToday ? "bg-gray-800" : ""}`}
          >
            <span className="text-xs font-medium text-gray-400">
              {dayName.toUpperCase()}
            </span>
            <span
              className={`text-xl font-bold ${isToday ? "text-white" : "text-gray-300"}`}
            >
              {currentDate.getDate()}
            </span>
          </div>
        </div>

        {/* Time rows */}
        <div className="flex-1 relative">
          {/* Current time indicator - only shown when viewing today */}
          {isToday && <CurrentTimeIndicator />}
          
          {timeSlots.map((time, index) => (
            <div key={index} className="flex min-h-16 border-b border-gray-800">
              {/* Time label */}
              <div className="w-16 flex-shrink-0 flex items-start justify-end pr-2 text-xs text-gray-400 border-r border-gray-800">
                <span className="relative -top-2">{convertToTime(time)}</span>
              </div>

              {/* Day slot */}
              <div
                className={`flex-1 min-w-[200px] border-r border-gray-800 relative ${isToday ? "bg-gray-900" : ""}`}
              >
                <SlotComponent
                  view="day"
                  date={dayjs(
                    dayjs(currentDate).format("YYYY-MM-DD") + "T" + time,
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
