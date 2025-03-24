'use client';

import { Media } from "@frontend/types/media";
import { MediaSelectionItem } from "./media-selection-item";

interface MediaSelectionGridProps {
  mediaItems: Media[];
  selectedItems: Media[];
  onToggleSelection: (item: Media) => void;
}

export function MediaSelectionGrid({ 
  mediaItems,
  selectedItems,
  onToggleSelection
}: MediaSelectionGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mediaItems.map((media) => (
        <MediaSelectionItem
          key={media.id}
          media={media}
          isSelected={selectedItems.some(item => item.id === media.id)}
          onToggleSelection={() => onToggleSelection(media)}
        />
      ))}
    </div>
  );
} 