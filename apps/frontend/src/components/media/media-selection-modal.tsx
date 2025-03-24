'use client';

import { useState, useEffect } from "react";
import { useFetch } from "@frontend/hooks/use-fetch";
import { useToast } from "@frontend/hooks/use-toast";
import { Media, MediaResponse } from "@frontend/types/media";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@frontend/components/ui/dialog";
import { Button } from "@frontend/components/ui/button";
import { MediaSelectionGrid } from "./media-selection-grid";
import { Pagination } from "./pagination";
import { LoadingState } from "./loading-state";
import { EmptyMediaState } from "./empty-media-state";

interface MediaSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (selectedMedia: Media[]) => void;
  initialSelectedMedia?: Media[];
  maxSelections?: number;
}

export function MediaSelectionModal({
  isOpen,
  onClose,
  onSelectMedia,
  initialSelectedMedia = [],
  maxSelections
}: MediaSelectionModalProps) {
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Media[]>(initialSelectedMedia);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const fetch = useFetch();
  const { toast } = useToast();

  // Load media from the API
  const loadMedia = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/media?page=${page}`);
      if (response.ok) {
        const data: MediaResponse = await response.json();
        setMediaItems(data.media);
        setTotalPages(data.count);
      } else {
        toast({
          title: "Error",
          description: "Failed to load media",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading media:", error);
      toast({
        title: "Error",
        description: "Failed to load media",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMedia(currentPage);
    }
  }, [isOpen, currentPage]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  // Handle media item selection
  const handleToggleSelection = (item: Media) => {
    setSelectedItems(prev => {
      // Check if the item is already selected
      const isSelected = prev.some(media => media.id === item.id);
      
      if (isSelected) {
        // Remove item from selection
        return prev.filter(media => media.id !== item.id);
      } else {
        // Add item to selection if not exceeding max selections
        if (maxSelections && prev.length >= maxSelections) {
          toast({
            title: "Selection limit reached",
            description: `You can select up to ${maxSelections} media items`,
          });
          return prev;
        }
        return [...prev, item];
      }
    });
  };

  // Handle confirmation of selection
  const handleConfirmSelection = () => {
    onSelectMedia(selectedItems);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <LoadingState />
        ) : (
          <>
            {mediaItems.length > 0 ? (
              <MediaSelectionGrid 
                mediaItems={mediaItems}
                selectedItems={selectedItems}
                onToggleSelection={handleToggleSelection}
              />
            ) : (
              <EmptyMediaState />
            )}

            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}

        <DialogFooter className="mt-4">
          <div className="flex justify-between w-full">
            <div className="text-sm text-gray-500">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
              {maxSelections && ` (max ${maxSelections})`}
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleConfirmSelection}>
                Confirm Selection
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 