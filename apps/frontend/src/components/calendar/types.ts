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
  channel: string;
  type: string;
  group: string;
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

export interface TimeSlotProps {
  time: string;
}

export interface ChannelItemProps {
  id: string;
  name: string;
  profilePic: string;
  identifier: string;
  isSelected?: boolean;
}
