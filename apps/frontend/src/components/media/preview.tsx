import { useState, useEffect, useCallback } from "react";
import { Button } from "@frontend/components/ui/button";
import { useFetch } from "@frontend/hooks/use-fetch";
import { useToast } from "@frontend/hooks/use-toast";
import { Video } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@frontend/components/ui/dialog";
import { Spinner } from "@frontend/components/ui/spinner";
import { Card, CardContent } from "@frontend/components/ui/card";

interface VideoModel {
  label: string;
  model: string;
  category: string;
  identifier: string;
}

interface MediaPreviewProps {
  generatedImage: string;
  generatedVideo: string;
  isLoading: boolean;
  prompt: string;
  onVideoGenerated: (videoUrl: string) => void;
}

export function MediaPreview({
  generatedImage,
  generatedVideo,
  isLoading,
  prompt,
  onVideoGenerated,
}: MediaPreviewProps) {
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoModels, setVideoModels] = useState<VideoModel[]>([]);
  const [selectedVideoModel, setSelectedVideoModel] = useState("");
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const fetch = useFetch();
  const { toast } = useToast();

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

    fetchVideoModels();
  }, []);

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
    const response = await fetch(`/models/generate`, {
      method: "POST",
      body: JSON.stringify({
        type: "video",
        prompt,
        videoModel: selectedVideoModel,
        image: generatedImage,
        model: selectedVideoModel,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const videoUrl = data.generated[0];
      onVideoGenerated(videoUrl);
      toast({
        title: "Success",
        description: "Video generated successfully",
      });
      setShowVideoDialog(false);
    } else {
      toast({
        title: "Error",
        description: "Failed to generate video",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="border border-[#3B3B3B] bg-[#151515] mb-6">
        <CardContent className="p-6">
          <div className="w-full h-96 bg-[#0A0A0A] rounded-md flex items-center justify-center mb-4">
            {isLoading ? (
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
            ) : generatedVideo ? (
              <video
                src={generatedVideo}
                controls
                className="w-full h-full object-contain"
              />
            ) : generatedImage ? (
              <img
                src={generatedImage}
                alt="Generated"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <p>Your generated media will appear here</p>
              </div>
            )}
          </div>
          {generatedImage && !generatedVideo && (
            <div className="flex justify-end">
              <Button
                onClick={() => setShowVideoDialog(true)}
                className="flex items-center"
                variant="outline"
              >
                <Video className="h-4 w-4 mr-2" />
                Generate Video
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Model Selection Dialog */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
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
            <Button variant="outline" onClick={() => setShowVideoDialog(false)}>
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
    </>
  );
}
