"use client";

import { useState, useEffect } from "react";
import { CalendarHeader } from "./calendar-header";
import { CalendarSidebar } from "./calendar-sidebar";
import { CalendarGrid } from "./calendar-grid";
import { ViewType, Event } from "./types";
import { fetchCalendarEvents } from "./calendarUtils";

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>("Week");
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch events whenever the date or view type changes
  useEffect(() => {
    async function loadEvents() {
      setIsLoading(true);
      setError(null);

      try {
        const fetchedEvents = await fetchCalendarEvents(viewType, currentDate);

        // Transform dates from strings to Date objects if they're coming from an API
        const processedEvents = fetchedEvents.map((event: any) => ({
          ...event,
          startTime:
            event.startTime instanceof Date
              ? event.startTime
              : new Date(event.startTime),
          endTime:
            event.endTime instanceof Date
              ? event.endTime
              : new Date(event.endTime),
        }));

        setEvents(processedEvents);
      } catch (err) {
        console.error("Error loading events:", err);
        setError("Failed to load calendar events. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    loadEvents();
  }, [currentDate, viewType]);

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewType === "Day") {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewType === "Week") {
      newDate.setDate(newDate.getDate() - 7);
    } else if (viewType === "Month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewType === "Year") {
      newDate.setFullYear(newDate.getFullYear() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === "Day") {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewType === "Week") {
      newDate.setDate(newDate.getDate() + 7);
    } else if (viewType === "Month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewType === "Year") {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col">
      <h2 className="text-2xl font-bold mb-6">Calendar</h2>
      <div className="flex gap-[20px]">
        <CalendarSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <CalendarHeader
            currentDate={currentDate}
            viewType={viewType}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onToday={handleToday}
            onViewChange={setViewType}
          />

          {isLoading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
              <span className="ml-2 text-gray-400">Loading events...</span>
            </div>
          )}

          {error && (
            <div className="flex-1 flex items-center justify-center text-red-500">
              <span>{error}</span>
            </div>
          )}

          {!isLoading && !error && (
            <CalendarGrid
              currentDate={currentDate}
              viewType={viewType}
              events={events}
            />
          )}
        </div>
      </div>
    </div>
  );
}
