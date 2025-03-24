"use client";

import { Button } from "@frontend/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetch } from "@frontend/hooks/use-fetch";
import { useToast } from "@frontend/hooks/use-toast";
import { saveAs } from "file-saver";
import { MediaCard } from "./media-card";
import { Pagination } from "./pagination";
import { EmptyMediaState } from "./empty-media-state";
import { LoadingState } from "./loading-state";
import { Media, MediaResponse } from "@frontend/types/media";

export function MediaPage() {
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const fetch = useFetch();
  const { toast } = useToast();

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

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      // First click - ask for confirmation
      setDeleteConfirm(id);
      return;
    }

    try {
      const response = await fetch(`/media/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Media deleted successfully",
        });
        // Refresh the media list
        loadMedia(currentPage);
      } else {
        toast({
          title: "Error",
          description: "Failed to delete media",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting media:", error);
      toast({
        title: "Error",
        description: "Failed to delete media",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Cancel delete confirmation if clicked elsewhere
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Function to download media
  const handleDownload = async (media: Media) => {
    try {
      saveAs(
        media.media,
        `${media.prompt.substring(0, 20).replace(/[^a-z0-9]/gi, "_")}_${media.id}.${media.media.split(".").pop()}`,
      );

      toast({
        title: "Success",
        description: `${media.type.toLowerCase()} downloaded successfully`,
      });
    } catch (error) {
      console.error("Error downloading media:", error);
      toast({
        title: "Error",
        description: "Failed to download media",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    loadMedia(newPage);
  };

  useEffect(() => {
    loadMedia(currentPage);
  }, []);

  // Function to handle video play on hover
  const handleVideoMouseEnter = (videoElement: HTMLVideoElement) => {
    if (videoElement) {
      // Reset to the beginning if it was previously played
      if (videoElement.currentTime > 0) {
        videoElement.currentTime = 0;
      }
      videoElement
        .play()
        .catch((err) => console.error("Error playing video:", err));
    }
  };

  // Function to handle video pause on mouse leave
  const handleVideoMouseLeave = (videoElement: HTMLVideoElement) => {
    if (videoElement) {
      videoElement.pause();
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto" onClick={cancelDelete}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Media</h2>
        <Link href="/media/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Media
          </Button>
        </Link>
      </div>

      {loading ? (
        <LoadingState />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaItems.length > 0 ? (
              mediaItems.map((media) => (
                <MediaCard
                  key={media.id}
                  media={media}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                  deleteConfirm={deleteConfirm}
                  onVideoMouseEnter={handleVideoMouseEnter}
                  onVideoMouseLeave={handleVideoMouseLeave}
                />
              ))
            ) : (
              <EmptyMediaState />
            )}
          </div>

          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
