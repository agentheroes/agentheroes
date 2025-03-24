"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { useFetch } from "@frontend/hooks/use-fetch";
import { Event, ViewType } from "./types";
import { fetchCalendarEvents } from "./calendar.utils";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

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
  changeEventDate: (group: string, date: string) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined,
);

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
}

interface CalendarProviderProps {
  children: ReactNode;
}

export function CalendarProvider({ children }: CalendarProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL query parameters if they exist
  const initializeFromUrl = () => {
    const dateParam = searchParams.get("date");
    const viewTypeParam = searchParams.get("view") as ViewType | null;

    let initialDate = new Date();
    if (dateParam) {
      try {
        // Ensure proper timezone handling by using YYYY-MM-DDT00:00:00 format
        // This preserves the local date regardless of timezone
        const [year, month, day] = dateParam.split("-").map(Number);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          initialDate = new Date(year, month - 1, day, 0, 0, 0);
        }
      } catch (err) {}
    }

    const validViewTypes: ViewType[] = ["Day", "Week", "Month", "Year"];
    const initialViewType: ViewType =
      viewTypeParam && validViewTypes.includes(viewTypeParam)
        ? viewTypeParam
        : "Week";

    return { initialDate, initialViewType };
  };

  const { initialDate, initialViewType } = initializeFromUrl();

  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [viewType, setViewType] = useState<ViewType>(initialViewType);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetch = useFetch();

  const changeEventDate = useCallback(
    (group: string, date: string) => {
      fetch(`/socials/calendar/move/${group}`, {
        body: JSON.stringify({ date }),
        method: "PUT",
      });

      setEvents((e) => {
        return e.map((p) => {
          if (p.group === group) {
            return {
              ...p,
              date,
            };
          }

          return p;
        });
      });
    },
    [events],
  );

  // Function to update the URL with current date and view type
  const updateUrlParams = useCallback(() => {
    // Create a new URLSearchParams object
    const params = new URLSearchParams();

    // Preserve any existing query parameters except date and view
    searchParams.forEach((value, key) => {
      if (key !== "date" && key !== "view") {
        params.set(key, value);
      }
    });

    // Format date in YYYY-MM-DD format preserving the local date
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    // Update or add date and view parameters
    params.set("date", dateString);
    params.set("view", viewType);

    // Update the URL without refreshing the page
    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  }, [currentDate, viewType, router, pathname, searchParams]);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the fetchCalendarEvents function from calendarUtils with the abort signal
      const fetchedEvents = await fetchCalendarEvents(
        viewType,
        currentDate,
        (url, requestInit = {}) =>
          fetch(url, {
            ...requestInit,
          }),
      );

      // Transform dates from strings to Date objects if needed
      const transformedEvents: Event[] = fetchedEvents.map((event: any) => ({
        id: event.id,
        title: event.content,
        date: event.date,
        channel: event.channelId,
        type: event.type,
        group: event.group,
      }));

      setEvents(transformedEvents);
      setIsLoading(false);
    } catch (err) {
      // Only report errors if the request wasn't aborted
      if (err instanceof DOMException && err.name === "AbortError") {
      } else {
        setError("Failed to load calendar events. Please try again later.");
      }
    } finally {
    }
  }, [currentDate, viewType, fetch]);

  const refreshEvents = async () => {
    await fetchEvents();
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewType === "Day") {
      newDate.setDate(currentDate.getDate() - 1);
    } else if (viewType === "Week") {
      newDate.setDate(currentDate.getDate() - 7);
    } else if (viewType === "Month") {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else if (viewType === "Year") {
      newDate.setFullYear(currentDate.getFullYear() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === "Day") {
      newDate.setDate(currentDate.getDate() + 1);
    } else if (viewType === "Week") {
      newDate.setDate(currentDate.getDate() + 7);
    } else if (viewType === "Month") {
      newDate.setMonth(currentDate.getMonth() + 1);
    } else if (viewType === "Year") {
      newDate.setFullYear(currentDate.getFullYear() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Custom view type setter that updates the URL
  const handleViewTypeChange = (view: ViewType) => {
    setViewType(view);
  };

  // Fetch events when the date or view type changes (except on initial mount)
  useEffect(() => {
    fetchEvents();
  }, [currentDate, viewType, fetchEvents]);

  // Update URL params
  useEffect(() => {
    updateUrlParams();
  }, [currentDate, viewType, updateUrlParams]);

  return (
    <CalendarContext.Provider
      value={{
        currentDate,
        viewType,
        events,
        isLoading,
        error,
        changeEventDate,
        handlePrevious,
        handleNext,
        handleToday,
        setViewType: handleViewTypeChange,
        refreshEvents,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}
