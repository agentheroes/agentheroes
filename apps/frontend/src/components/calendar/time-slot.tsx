'use client';

import React from 'react';
import { TimeSlotProps } from './types';

export function TimeSlot({ time }: TimeSlotProps) {
  return (
    <div className="h-16 flex items-start justify-end pr-2 text-xs text-gray-400 border-b border-gray-800">
      <span className="relative -top-2">{time}</span>
    </div>
  );
} 