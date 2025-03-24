"use client";

import { useState } from "react";
import { Button } from "@frontend/components/ui/button";
import { Video, Download } from "lucide-react";
import { Card, CardContent } from "@frontend/components/ui/card";
import { VideoDialog } from "./video-dialog";
import { saveAs } from "file-saver";

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

  const handleDownload = () => {
    try {
      const mediaUrl = generatedVideo || generatedImage;
      if (!mediaUrl) return;
      
      // Determine file extension based on media type
      const isVideo = !!generatedVideo;
      const extension = isVideo ? "mp4" : mediaUrl.split('.').pop();
      
      // Create filename from prompt (truncate and sanitize)
      const sanitizedPrompt = prompt.substring(0, 20).replace(/[^a-z0-9]/gi, '_');
      const filename = `${sanitizedPrompt}_${Date.now()}.${extension}`;

      // Download the file
      saveAs(mediaUrl, filename);
    } catch (error) {
      console.error("Error downloading media:", error);
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
          {generatedImage && (
            <div className="flex justify-end gap-2">
              {(generatedImage || generatedVideo) && (
                <Button
                  onClick={handleDownload}
                  className="flex items-center"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
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

      {/* Video Dialog Component */}
      <VideoDialog 
        open={showVideoDialog}
        onOpenChange={setShowVideoDialog}
        generatedImage={generatedImage}
        prompt={prompt}
        onVideoGenerated={onVideoGenerated}
      />
    </>
  );
}
