"use client";

import { FC } from "react";

interface ScheduledTriggerProps {
  schedule: string;
  onScheduleChange: (schedule: string) => void;
}

export const ScheduledTrigger: FC<ScheduledTriggerProps> = ({
  schedule,
  onScheduleChange,
}) => {
  return (
    <div className="mb-4">
      <label
        htmlFor="schedule"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Schedule (Cron Expression)
      </label>
      <input
        type="text"
        id="schedule"
        value={schedule}
        onChange={(e) => onScheduleChange(e.target.value)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        placeholder="0 0 * * *"
      />
      <p className="text-xs text-gray-500 mt-1">
        Format: minute hour day-of-month month day-of-week
      </p>
      <div className="mt-3 text-xs text-gray-600">
        <div className="mb-1">Examples:</div>
        <ul className="list-disc pl-5 space-y-1">
          <li><span className="font-mono">0 0 * * *</span> - Daily at midnight</li>
          <li><span className="font-mono">0 12 * * 1-5</span> - Weekdays at noon</li>
          <li><span className="font-mono">0 9 1 * *</span> - First day of month at 9 AM</li>
        </ul>
      </div>
    </div>
  );
}; 