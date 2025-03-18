import { CSSProperties } from 'react';

export type ViewType = 'Day' | 'Week' | 'Month' | 'Year';

export interface Day {
  name: string;
  date: Date;
  isToday: boolean;
}

export interface Event {
  id: string;
  title: string;
  date: string;
}

export interface CalendarHeaderProps {
  currentDate: Date;
  viewType: ViewType;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: ViewType) => void;
}

export interface CalendarGridProps {
  currentDate: Date;
  viewType: ViewType;
  events: Event[];
}

export interface DayColumnProps {
  day: Day;
  timeSlots: string[];
  events: Event[];
  isToday: boolean;
}

export interface TimeSlotProps {
  time: string;
}

export interface CalendarEventProps {
  title: string;
  time: string;
  color: string;
  style: CSSProperties;
}

export interface ChannelItemProps {
  id: string;
  name: string;
  profilePic: string;
  identifier: string;
  isSelected?: boolean;
}

export interface SocialMedia {
  id: string;
  identifier: string;
  name: string;
  profilePic: string;
} 