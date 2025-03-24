'use client';

import { useEffect, useState } from 'react';

export function CurrentTimeIndicator() {
  const [top, setTop] = useState<number>(0);
  
  useEffect(() => {
    // Calculate the position based on current time
    const calculatePosition = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // Each hour block is 4rem (min-h-16 = 4rem)
      // Calculate percentage of the current hour that has passed
      const hourHeight = 64; // 4rem = 64px
      const percentOfHourPassed = minutes / 60;
      
      // Position = (hours * hourHeight) + (percentOfHourPassed * hourHeight)
      const position = (hours * hourHeight) + (percentOfHourPassed * hourHeight);
      setTop(position);
    };
    
    // Calculate position initially
    calculatePosition();
    
    // Update position every minute
    const intervalId = setInterval(calculatePosition, 60000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div 
      className="absolute left-0 right-0 z-10 pointer-events-none" 
      style={{ top: `${top}px` }}
    >
      <div className="flex items-center w-full">
        <div className="w-16 flex-shrink-0 relative">
          <div className="-mt-[4px] absolute right-0 w-2 h-2 rounded-full bg-orange-500"></div>
        </div>
        <div className="flex-1 h-[2px] bg-orange-500"></div>
      </div>
    </div>
  );
} 