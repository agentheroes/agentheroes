'use client';

import React, { useRef } from "react";
import { Media } from "@frontend/types/media";
import { Card, CardContent } from "@frontend/components/ui/card";
import { Check } from "lucide-react";

interface MediaSelectionItemProps {
  media: Media;
  isSelected: boolean;
  onToggleSelection: () => void;
}

export function MediaSelectionItem({
  media,
  isSelected,
  onToggleSelection
}: MediaSelectionItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle video hover for preview
  const handleMouseEnter = () => {
    if (media.type === "VIDEO" && videoRef.current) {
      if (videoRef.current.currentTime > 0) {
        videoRef.current.currentTime = 0;
      }
      videoRef.current.play().catch(err => console.error("Error playing video:", err));
    }
  };

  const handleMouseLeave = () => {
    if (media.type === "VIDEO" && videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <Card 
      className={`
        overflow-hidden relative cursor-pointer transition-all
        ${isSelected ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'}
      `}
      onClick={onToggleSelection}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardContent className="p-0 aspect-video relative">
        {media.type === "IMAGE" ? (
          <img 
            src={media.media} 
            alt={media.prompt} 
            className="w-full h-full object-cover"
          />
        ) : (
          <video 
            ref={videoRef}
            src={media.media}
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-md">
            <Check className="h-4 w-4" />
          </div>
        )}
        
        {/* Media type indicator */}
        <div className="absolute bottom-2 left-2 bg-background/80 text-foreground text-xs px-2 py-1 rounded-md shadow-sm">
          {media.type}
        </div>
      </CardContent>
    </Card>
  );
} 