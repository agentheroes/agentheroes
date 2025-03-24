'use client';

import React from 'react';
import { TimeSlotProps } from './types';
import {convertToTime} from "@frontend/components/calendar/time-row";

export function TimeSlot({ time }: TimeSlotProps) {
  return (
    <div className="h-16 flex items-start justify-end pr-2 text-xs text-gray-400 border-b border-gray-800">
      <span className="relative -top-2">{convertToTime(time)}</span>
    </div>
  );
} 