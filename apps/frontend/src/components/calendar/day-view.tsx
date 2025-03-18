"use client";

import React from "react";
import { TimeSlot } from "./time-slot";
import { Event } from "./types";
import { SlotComponent } from "@frontend/components/calendar/slot.component";
import dayjs from "dayjs";

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
      <div className="flex h-full">
        {/* Time slots column */}
        <div className="w-16 flex-shrink-0 border-r border-gray-800">
          <div className="h-14 border-b border-gray-800">
            {" "}
            {/* Empty header cell */}
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
          <div
            className={`h-14 flex flex-col items-center justify-center border-b border-gray-800 ${isToday ? "bg-gray-800" : ""}`}
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

          {/* Time grid */}
          <div className="relative">
            {/* Render time slot backgrounds */}
            {timeSlots.map((time, index) => (
              <div key={index} className="relative min-h-16 border-b border-gray-800">
                <SlotComponent
                  date={dayjs(
                    dayjs(currentDate).format("YYYY-MM-DD") + "T" + time,
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
