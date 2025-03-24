"use client";

import { CalendarHeader } from "./calendar-header";
import { CalendarSidebar } from "./calendar-sidebar";
import { CalendarGrid } from "./calendar-grid";
import { SocialMediaProvider, useSocialMedia } from "./social.media.context";
import { CalendarProvider, useCalendar } from "./calendar.context";
import { PostDialogProvider } from "@frontend/components/post";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import { RefreshTokenWarning } from "./refresh-token-warning";

// Create a separate CalendarContent component to use the contexts
function CalendarContent() {
  // Get the social media context
  const { loading: socialsLoading, error: socialsError } = useSocialMedia();

  // Get the calendar context
  const {
    currentDate,
    viewType,
    events,
    isLoading,
    error,
    handlePrevious,
    handleNext,
    handleToday,
    setViewType,
  } = useCalendar();

  return (
    <div className="max-w-7xl w-full mx-auto flex flex-col">
      <h2 className="text-2xl font-bold mb-6">Calendar</h2>
      <RefreshTokenWarning />
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

          {/* Show loading for socials */}
          {socialsLoading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
              <span className="ml-2 text-gray-400">Loading channels...</span>
            </div>
          )}

          {/* Show error for socials */}
          {socialsError && (
            <div className="flex-1 flex items-center justify-center text-red-500">
              <span>{socialsError}</span>
            </div>
          )}

          {/* Only show calendar content after socials are loaded */}
          {!socialsLoading && !socialsError && (
            <>
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
                <DndProvider backend={HTML5Backend}>
                  <CalendarGrid
                    currentDate={currentDate}
                    viewType={viewType}
                    events={events}
                  />
                </DndProvider>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Calendar component that provides both contexts
export function Calendar() {
  return (
    <SocialMediaProvider>
      <CalendarProvider>
        <PostDialogProvider>
          <CalendarContent />
        </PostDialogProvider>
      </CalendarProvider>
    </SocialMediaProvider>
  );
}
