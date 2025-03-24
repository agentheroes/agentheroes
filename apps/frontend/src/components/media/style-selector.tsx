"use client";

import { useCallback } from "react";

interface MediaStyleSelectorProps {
  selectedStyle: string;
  onStyleSelect: (style: string) => void;
}

export function MediaStyleSelector({
  selectedStyle,
  onStyleSelect
}: MediaStyleSelectorProps) {
  const handleStyleSelect = useCallback((style: string) => {
    onStyleSelect(style);
  }, [onStyleSelect]);

  // Define all available styles
  const styles = [
    "realism", "comics", "painting", "anime", "cartoon", "pixel art",
    "watercolor", "oil painting", "3D render", "sketch", "abstract",
    "minimalist", "pop art", "cyberpunk", "fantasy"
  ];

  return (
    <div className="mb-6">
      <label className="block text-[#F0F0F0] mb-2">Style</label>
      <div className="grid grid-cols-3 gap-2">
        {styles.map((style) => (
          <div 
            key={style}
            className={`aspect-square bg-[#2A2A2A] rounded-md flex items-center justify-center cursor-pointer border-2 ${selectedStyle === style ? "border-[#FD7302]" : "border-transparent"}`}
            onClick={() => handleStyleSelect(style)}
          >
            <span className="text-[#F0F0F0] text-sm">{style.charAt(0).toUpperCase() + style.slice(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 