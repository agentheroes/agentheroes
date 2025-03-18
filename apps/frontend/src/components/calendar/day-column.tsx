"use client";

import React from "react";
import { CalendarEvent } from "./calendar-event";
import { DayColumnProps, Event } from "./types";
import { SlotComponent } from "@frontend/components/calendar/slot.component";
import dayjs from "dayjs";

export function DayColumn({ day, timeSlots, events, isToday }: DayColumnProps) {
  // Function to calculate the position and height of an event
  const getEventPosition = (event: Event) => {
    const startHour = event.startTime.getHours();
    const startMinute = event.startTime.getMinutes();
    const endHour = event.endTime.getHours();
    const endMinute = event.endTime.getMinutes();

    // Calculate top position
    const firstSlotHour = parseInt(timeSlots[0].split(":")[0], 10);
    const topPosition =
      (startHour - firstSlotHour) * 64 + (startMinute / 60) * 64; // 64px is the height of a time slot (h-16)

    // Calculate event height
    const durationInHours =
      endHour - startHour + (endMinute - startMinute) / 60;
    const height = durationInHours * 64;

    return { top: topPosition, height };
  };

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
          <div key={index} className="relative h-16 border-b border-gray-800">
            <SlotComponent
              date={dayjs(dayjs(day.date).format("YYYY-MM-DD") + "T" + time)}
            />
          </div>
        ))}

        {/* Render events */}
        {events.map((event) => {
          const { top, height } = getEventPosition(event);
          return (
            <CalendarEvent
              key={event.id}
              title={event.title}
              time={`${event.startTime.getHours()}:${event.startTime.getMinutes().toString().padStart(2, "0")} ${event.startTime.getHours() >= 12 ? "PM" : "AM"}`}
              color={event.color}
              style={{ top: `${top}px`, height: `${height}px` }}
            />
          );
        })}
      </div>
    </div>
  );
}
