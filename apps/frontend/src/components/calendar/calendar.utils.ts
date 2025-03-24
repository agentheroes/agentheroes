/**
 * Generate an array of time slots between start and end hours
 * @param startHour - The starting hour (0-23)
 * @param endHour - The ending hour (0-23)
 * @returns An array of time strings in the format "HH:00 AM/PM"
 */
export function generateTimeSlots(startHour: number, endHour: number): string[] {
  const slots: string[] = [];
  
  for (let hour = startHour; hour <= endHour; hour++) {
    const hourFormatted = hour % 12 === 0 ? 12 : hour % 12;
    const period = hour >= 12 ? 'PM' : 'AM';
    slots.push(`${hour.toString().length === 1 ? '0' : ''}${hour}:00:00`);
  }
  
  return slots;
}

/**
 * Get the week day name for a given date
 * @param date - The date to get the day name for
 * @returns The day name (e.g., "Mon", "Tue", etc.)
 */
function getDayName(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

/**
 * Check if a date is today
 * @param date - The date to check
 * @returns True if the date is today, false otherwise
 */
function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Generate an array of days for a week view
 * @param currentDate - The current date
 * @returns An array of day objects with name, date, and isToday properties
 */
export function generateWeekDays(currentDate: Date): { name: string; date: Date; isToday: boolean }[] {
  const days = [];
  const startOfWeek = new Date(currentDate);
  
  // Adjust to the start of the week (Monday)
  const day = currentDate.getDay();
  // Sunday is 0, so we need to convert: 0 -> 6, 1 -> 0, 2 -> 1, etc.
  const daysFromMonday = day === 0 ? 6 : day - 1;
  startOfWeek.setDate(currentDate.getDate() - daysFromMonday);
  
  // Generate 7 days starting from the start of the week (Monday)
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    
    days.push({
      name: getDayName(date),
      date: date,
      isToday: isToday(date),
    });
  }
  
  return days;
}

/**
 * Calculate date range based on view type and current date
 * @param viewType - The calendar view type ('Day', 'Week', 'Month', 'Year')
 * @param currentDate - The current date being viewed
 * @returns An object with startDate and endDate
 */
export function getDateRangeForView(viewType: 'Day' | 'Week' | 'Month' | 'Year', currentDate: Date): { 
  startDate: Date; 
  endDate: Date;
} {
  const startDate = new Date(currentDate);
  const endDate = new Date(currentDate);
  
  switch (viewType) {
    case 'Day':
      // For day view, start and end are the same day
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
      
    case 'Week':
      // For week view, start is Monday and end is Sunday
      const dayOfWeek = currentDate.getDay();
      // Convert day to days from Monday (0 for Monday, 6 for Sunday)
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate.setDate(currentDate.getDate() - daysFromMonday);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
      
    case 'Month':
      // For month view, start is the 1st of the month and end is the last day
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0); // Set to last day of current month
      endDate.setHours(23, 59, 59, 999);
      break;
      
    case 'Year':
      // For year view, start is January 1st and end is December 31st
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;
  }
  
  return { startDate, endDate };
}

/**
 * Format a date as an ISO string for API requests (YYYY-MM-DD)
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Fetch calendar events for a specific date range
 * @param viewType - The calendar view type ('Day', 'Week', 'Month', 'Year')
 * @param currentDate - The current date being viewed
 * @param fetchFn - The fetch function to use (from useFetch hook)
 * @returns A promise that resolves to an array of events
 */
export async function fetchCalendarEvents(
  viewType: 'Day' | 'Week' | 'Month' | 'Year', 
  currentDate: Date,
  fetchFn?: (url: string, requestInit?: RequestInit) => Promise<Response>
) {
  const { startDate, endDate } = getDateRangeForView(viewType, currentDate);
  
  // Format dates for API request
  const startDateStr = formatDateForAPI(startDate);
  const endDateStr = formatDateForAPI(endDate);
  
  try {
    // Construct the API URL with query parameters
    const url = `/socials/calendar?startDate=${startDateStr}&endDate=${endDateStr}`;
    
    // Make the request using the provided fetch function or fallback to native fetch
    const response = fetchFn 
      ? await fetchFn(url) 
      : await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching calendar events: ${response.statusText}`);
    }
    
    // Parse and return the events
    const events = await response.json();
    return events;
  } catch (error) {
    console.error('Failed to fetch calendar events:', error);
    // Return some mock data for now
    return [];
  }
} 