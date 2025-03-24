'use client';

import { Media } from "@frontend/types/media";
import { X } from "lucide-react";
import { Button } from "@frontend/components/ui/button";

interface SelectedMediaDisplayProps {
  selectedMedia: Media[];
  onRemoveMedia: (mediaId: string) => void;
}

export function SelectedMediaDisplay({ 
  selectedMedia,
  onRemoveMedia
}: SelectedMediaDisplayProps) {
  if (selectedMedia.length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      <div className="text-sm text-gray-500 mb-2">
        Attached media ({selectedMedia.length}):
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedMedia.map((media) => (
          <div 
            key={media.id} 
            className="relative group rounded-md overflow-hidden border border-border"
          >
            {/* Preview of media */}
            <div className="w-16 h-16 relative">
              {media.media === "IMAGE" ? (
                <img 
                  src={media.media} 
                  alt={media.prompt} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <video 
                  src={media.media}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Type label */}
              <div className="absolute bottom-1 left-1 bg-background/80 text-xs px-1 py-0.5 rounded">
                {media.type.toLowerCase()}
              </div>
              
              {/* Remove button */}
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 h-5 w-5 !p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveMedia(media.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 