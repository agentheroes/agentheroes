'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFetch } from "@frontend/hooks/use-fetch";
import { Event, ViewType } from './types';
import { fetchCalendarEvents } from './calendarUtils';

interface CalendarContextType {
  currentDate: Date;
  viewType: ViewType;
  events: Event[];
  isLoading: boolean;
  error: string | null;
  handlePrevious: () => void;
  handleNext: () => void;
  handleToday: () => void;
  setViewType: (view: ViewType) => void;
  refreshEvents: () => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
}

interface CalendarProviderProps {
  children: ReactNode;
}

export function CalendarProvider({ children }: CalendarProviderProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<ViewType>('Month');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetch = useFetch();

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the fetchCalendarEvents function from calendarUtils
      const fetchedEvents = await fetchCalendarEvents(viewType, currentDate, fetch);
      
      // Transform dates from strings to Date objects if needed
      const transformedEvents: Event[] = fetchedEvents.map((event: any) => ({
        id: event.id,
        title: event.content,
        date: event.date,
      }));
      
      setEvents(transformedEvents);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setError('Failed to load calendar events. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshEvents = async () => {
    await fetchEvents();
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'Day') {
      newDate.setDate(currentDate.getDate() - 1);
    } else if (viewType === 'Week') {
      newDate.setDate(currentDate.getDate() - 7);
    } else if (viewType === 'Month') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else if (viewType === 'Year') {
      newDate.setFullYear(currentDate.getFullYear() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'Day') {
      newDate.setDate(currentDate.getDate() + 1);
    } else if (viewType === 'Week') {
      newDate.setDate(currentDate.getDate() + 7);
    } else if (viewType === 'Month') {
      newDate.setMonth(currentDate.getMonth() + 1);
    } else if (viewType === 'Year') {
      newDate.setFullYear(currentDate.getFullYear() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Fetch events when the date or view type changes
  useEffect(() => {
    fetchEvents();
  }, [currentDate, viewType]);

  return (
    <CalendarContext.Provider
      value={{
        currentDate,
        viewType,
        events,
        isLoading,
        error,
        handlePrevious,
        handleNext,
        handleToday,
        setViewType,
        refreshEvents
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
} 