"use client";

import { Button } from "@frontend/components/ui/button";
import Link from "next/link";
import { Plus, Trash2, Image, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetch } from "@frontend/hooks/use-fetch";
import { Card } from "@frontend/components/ui/card";
import { useToast } from "@frontend/hooks/use-toast";

interface Media {
  id: string;
  characterId: string;
  prompt: string;
  text?: string;
  media: string;
  createdAt: string;
  updatedAt: string;
}

export function MediaPage() {
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fetch = useFetch();
  const { toast } = useToast();

  const loadMedia = async () => {
    try {
      setLoading(true);
      const response = await fetch("/media");
      if (response.ok) {
        const data = await response.json();
        setMediaItems(data);
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
        loadMedia();
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

  useEffect(() => {
    loadMedia();
  }, []);

  return (
    <div className="max-w-4xl mx-auto" onClick={cancelDelete}>
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
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading media...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediaItems.length > 0 ? (
            mediaItems.map((media) => (
              <Card 
                key={media.id} 
                className="border border-[#3B3B3B] rounded-lg pt-4 pl-4 pr-4 flex flex-col bg-[#151515] relative"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-[#F0F0F0] line-clamp-1">{media.prompt}</h3>
                    <p className="text-sm text-[#A0A0A0] mt-1">
                      {new Date(media.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant={deleteConfirm === media.id ? "destructive" : "ghost"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(media.id);
                    }}
                    className="h-8 w-8 !p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="-mx-4 mt-4 flex-grow flex items-center justify-center">
                  {media.media ? (
                    <div className="w-full h-32 overflow-hidden border-2 border-[#3B3B3B]">
                      <img 
                        src={media.media}
                        alt={media.prompt} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // If image fails to load, replace with placeholder
                          (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23F0F0F0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-[#2A2A2A] flex items-center justify-center">
                      <Image className="h-16 w-16 text-[#F0F0F0]" />
                    </div>
                  )}
                </div>
                
                {media.text && (
                  <p className="text-[#A0A0A0] mt-4 line-clamp-2 text-center">{media.text}</p>
                )}
                
                {deleteConfirm === media.id && (
                  <div 
                    className="absolute inset-0 bg-black/80 flex items-center justify-center flex-col rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-white mb-4 text-center">Are you sure you want to delete this media?</p>
                    <div className="flex space-x-2">
                      <Button 
                        variant="destructive" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(media.id);
                        }}
                      >
                        Delete
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <div className="border border-[#3B3B3B] rounded-lg p-4 text-center flex flex-col items-center justify-center h-64 bg-[#151515] col-span-full">
              <Image className="h-12 w-12 text-[#F0F0F0] mb-2" />
              <p className="text-[#F0F0F0]">No media yet</p>
              <Link href="/media/create" className="mt-4">
                <Button>Create Your First Media</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 