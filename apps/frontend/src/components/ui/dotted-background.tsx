"use client";

import React from "react";

interface DottedBackgroundProps {
  children: React.ReactNode;
  dotColor?: string;
  bgColor?: string;
  dotSize?: number;
  spacing?: number;
}

export function DottedBackground({
  children,
  dotColor = "#2A2A2A", // Dark dot color
  bgColor = "#1A1A1A", // Darker background
  dotSize = 1,
  spacing = 20,
}: DottedBackgroundProps) {
  return (
    <div
      className="relative w-full flex-1"
      style={{
        backgroundColor: bgColor,
        backgroundImage: `radial-gradient(${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: `${spacing}px ${spacing}px`,
        backgroundPosition: "0 0, 10px 10px",
      }}
    >
      {children}
    </div>
  );
} 