"use client";

import { FC } from "react";

interface ManualTriggerProps {
  // No specific props needed for manual trigger
}

export const ManualTrigger: FC<ManualTriggerProps> = () => {
  return (
    <div className="p-3 bg-gray-50 rounded-md">
      <p className="text-sm text-gray-600">
        This agent will be triggered manually by a user.
      </p>
    </div>
  );
}; 