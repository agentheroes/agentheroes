"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@frontend/components/ui/button";
import { useFetch } from "@frontend/hooks/use-fetch";
import { useToast } from "@frontend/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@frontend/components/ui/dialog";
import { Spinner } from "@frontend/components/ui/spinner";
import { useUser } from "@frontend/hooks/use-user";
import useSWR from "swr";

interface VideoModel {
  label: string;
  model: string;
  category: string;
  identifier: string;
}

interface VideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  generatedImage: string;
  prompt: string;
  onVideoGenerated: (videoUrl: string) => void;
}

export function VideoDialog({
  open,
  onOpenChange,
  generatedImage,
  prompt,
  onVideoGenerated,
}: VideoDialogProps) {
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoModels, setVideoModels] = useState<VideoModel[]>([]);
  const [selectedVideoModel, setSelectedVideoModel] = useState("");
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const isMounted = useRef(true);

  const fetch = useFetch();
  const { toast } = useToast();
  const { mutate } = useSWR("/user/self");

  // Track component mount status
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Reset all state when dialog closes
  useEffect(() => {
    if (!open) {
      setIsGeneratingVideo(false);
      setSelectedVideoModel("");
      setIsLoadingModels(false);
    }
  }, [open]);

  // Fetch video models
  useEffect(() => {
    const fetchVideoModels = async () => {
      setIsLoadingModels(true);
      try {
        const response = await fetch("/models");
        if (response.ok) {
          const data = await response.json();
          if (data.list && data.list["video"]) {
            setVideoModels(data.list["video"]);
            if (data.list["video"].length > 0) {
              setSelectedVideoModel(data.list["video"][0].model);
            }
          }
        }
      } catch (error) {
        console.error("Error loading video models:", error);
        toast({
          title: "Error",
          description: "Failed to load video models. Please try again.",
          variant: "destructive",
        });
        setVideoModels([]);
      } finally {
        setIsLoadingModels(false);
      }
    };

    if (open) {
      fetchVideoModels();
    } else {
      // Reset videoModels when dialog closes
      setVideoModels([]);
    }
  }, [open, fetch, toast]);

  const handleVideoModelSelect = useCallback((model: string) => {
    setSelectedVideoModel(model);
  }, []);

  const handleGenerateVideo = async () => {
    if (!generatedImage) {
      toast({
        title: "Error",
        description: "Please generate an image first",
        variant: "destructive",
      });
      return;
    }

    if (!selectedVideoModel) {
      toast({
        title: "Error",
        description: "Please select a video model",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingVideo(true);
    try {
      const response = await fetch(`/models/generate`, {
        method: "POST",
        body: JSON.stringify({
          type: "video",
          prompt,
          videoModel: selectedVideoModel,
          saveAsMedia: true,
          image: generatedImage,
          model: selectedVideoModel,
        }),
      });

      // Check if dialog is still open before proceeding
      if (!isMounted.current || !open) return;

      if (response.ok) {
        const data = await response.json();
        const videoUrl = data.generated[0];
        onVideoGenerated(videoUrl);
        
        // Refresh user data to update credits
        await mutate();
        
        toast({
          title: "Success",
          description: "Video generated successfully",
        });
        onOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to generate video",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating video:", error);
      // Only show error toast if component is still mounted and dialog is open
      if (isMounted.current && open) {
        toast({
          title: "Error",
          description: "Failed to generate video",
          variant: "destructive",
        });
      }
    } finally {
      // Only update state if component is still mounted and dialog is open
      if (isMounted.current && open) {
        setIsGeneratingVideo(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#151515] border border-[#3B3B3B]">
        <DialogHeader>
          <DialogTitle className="text-[#F0F0F0]">Generate Video</DialogTitle>
          <DialogDescription className="text-[#A0A0A0]">
            Select a video model to generate a video from your image.
          </DialogDescription>
        </DialogHeader>

        {isLoadingModels ? (
          <div className="flex items-center justify-center p-8 text-[#F0F0F0]">
            <Spinner className="mr-2" />
            <span>Loading video models...</span>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-3">
              {videoModels.map((model) => (
                <div
                  key={model.model}
                  className={`border border-[#3B3B3B] rounded-lg p-3 cursor-pointer transition-all hover:border-[#FD7302] ${
                    selectedVideoModel === model.model
                      ? "bg-[#252525] border-[#FD7302]"
                      : ""
                  }`}
                  onClick={() => handleVideoModelSelect(model.model)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-[#F0F0F0]">
                        {model.label}
                      </div>
                      <div className="text-sm text-[#A0A0A0] mt-1">
                        Provider: {model.identifier}
                      </div>
                    </div>
                    {selectedVideoModel === model.model && (
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-[#353535] text-[#FD7302]">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {videoModels.length === 0 && (
                <div className="text-center p-4 border border-[#3B3B3B] rounded-lg bg-[#2A2A2A]">
                  <p className="text-[#F0F0F0]">No video models available</p>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerateVideo}
            disabled={isGeneratingVideo || !selectedVideoModel}
          >
            {isGeneratingVideo ? (
              <>
                <Spinner className="mr-2" />
                Generating...
              </>
            ) : (
              "Generate Video"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 