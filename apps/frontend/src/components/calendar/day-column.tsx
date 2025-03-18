"use client";

import React from "react";
import { DayColumnProps, Event } from "./types";
import { SlotComponent } from "@frontend/components/calendar/slot.component";
import dayjs from "dayjs";

export function DayColumn({ day, timeSlots, events, isToday }: DayColumnProps) {
  return (
    <div
      className={`flex-1 border-r border-gray-800 min-w-[100px] ${isToday ? "bg-gray-900" : ""}`}
    >
      {/* Day header */}
      <div
        className={`h-14 flex flex-col items-center justify-center border-b border-gray-800 ${isToday ? "bg-gray-800" : ""}`}
      >
        <span className="text-xs font-medium text-gray-400">
          {day.name.toUpperCase()}
        </span>
        <span
          className={`text-xl font-bold ${isToday ? "text-white" : "text-gray-300"}`}
        >
          {day.date.getDate()}
        </span>
      </div>

      {/* Time grid */}
      <div className="relative">
        {/* Render time slot backgrounds */}
        {timeSlots.map((time, index) => (
          <div key={index} className="relative min-h-16 border-b border-gray-800">
            <SlotComponent
              date={dayjs(dayjs(day.date).format("YYYY-MM-DD") + "T" + time)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
