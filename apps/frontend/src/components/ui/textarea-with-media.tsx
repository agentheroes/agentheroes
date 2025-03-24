'use client';

import React, { useState } from "react";
import { Textarea, TextareaProps } from "@frontend/components/ui/textarea";
import { Button } from "@frontend/components/ui/button";
import { Image, Plus } from "lucide-react";
import { Media } from "@frontend/types/media";
import { MediaSelectionModal } from "@frontend/components/media/media-selection-modal";
import { SelectedMediaDisplay } from "@frontend/components/media/selected-media-display";

interface TextareaWithMediaProps extends Omit<TextareaProps, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  selectedMedia: Media[];
  onMediaChange: (media: Media[]) => void;
  maxMediaSelections?: number;
  maxHeight?: string | number;
}

export function TextareaWithMedia({
  value,
  onChange,
  selectedMedia,
  onMediaChange,
  maxMediaSelections,
  maxHeight = '200px',
  ...props
}: TextareaWithMediaProps) {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleOpenMediaSelector = () => {
    setIsMediaModalOpen(true);
  };

  const handleCloseMediaSelector = () => {
    setIsMediaModalOpen(false);
  };

  const handleSelectMedia = (media: Media[]) => {
    onMediaChange(media);
  };

  const handleRemoveMedia = (mediaId: string) => {
    onMediaChange(selectedMedia.filter(media => media.id !== mediaId));
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Textarea
          value={value}
          onChange={handleTextChange}
          style={{ maxHeight }}
          className="resize-y min-h-[100px]"
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-2 bottom-2 h-8 w-8 !p-0"
          onClick={handleOpenMediaSelector}
          title="Add media"
        >
          <Image className="h-4 w-4" />
        </Button>
      </div>

      <SelectedMediaDisplay
        selectedMedia={selectedMedia}
        onRemoveMedia={handleRemoveMedia}
      />

      <MediaSelectionModal
        isOpen={isMediaModalOpen}
        onClose={handleCloseMediaSelector}
        onSelectMedia={handleSelectMedia}
        initialSelectedMedia={selectedMedia}
        maxSelections={maxMediaSelections}
      />
    </div>
  );
} 