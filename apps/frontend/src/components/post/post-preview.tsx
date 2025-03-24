"use client";

import { useState } from "react";
import { Button } from "@frontend/components/ui/button";
import { Edit2, User } from "lucide-react";
import { Media } from "@frontend/types/media";
import { PostContent } from "./custom-post-editor";

interface PostPreviewProps {
  posts: PostContent[];
  channels: string[];
  activeTab: string;
  onEditCustom: (channelId: string) => void;
  socials: any[];
}

// Post preview component that displays how the post will look on social media
export function PostPreview({
  posts,
  channels,
  activeTab,
  onEditCustom,
  socials,
}: PostPreviewProps) {
  const [playingVideos, setPlayingVideos] = useState<Record<string, boolean>>(
    {},
  );

  // Find selected social platform
  const activeSocial = socials.find((social) => social.id === activeTab);

  // Handle video play on hover
  const handleVideoMouseEnter = (
    videoElement: HTMLVideoElement,
    videoId: string,
  ) => {
    if (!videoElement) return;

    // Mark this video as attempting to play
    setPlayingVideos((prev) => ({ ...prev, [videoId]: true }));

    // Reset to the beginning if it was previously played
    if (videoElement.currentTime > 0) {
      videoElement.currentTime = 0;
    }

    // Handle the play Promise properly to avoid AbortError
    const playPromise = videoElement.play();

    // Not all browsers return a promise from play()
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        // Only log errors other than AbortError
        if (error.name !== "AbortError") {
          console.error("Error playing video:", error);
        }
      });
    }
  };

  // Handle video pause on mouse leave
  const handleVideoMouseLeave = (
    videoElement: HTMLVideoElement,
    videoId: string,
  ) => {
    if (!videoElement) return;

    // Mark this video as no longer playing
    setPlayingVideos((prev) => ({ ...prev, [videoId]: false }));

    // Check if video is actually playing before trying to pause
    if (!videoElement.paused) {
      videoElement.pause();
    }
  };

  // Function to render media based on type
  const renderMedia = (item: Media, index: number) => {
    if (!item.media) return null;

    // Create a unique ID for this media item
    const mediaId = `${item.id || index}-${activeTab}`;

    // Check if the media is a video based on type or file extension
    const isVideo =
      item.type === "VIDEO" ||
      (typeof item.media === "string" && item.media.indexOf('mp4') > -1);

    if (isVideo) {
      return (
        <video
          src={item.media}
          className="w-full h-full object-cover"
          loop
          muted
          playsInline
          onMouseEnter={(e) => handleVideoMouseEnter(e.currentTarget, mediaId)}
          onMouseLeave={(e) => handleVideoMouseLeave(e.currentTarget, mediaId)}
        />
      );
    }

    // Default to image
    return (
      <img
        src={item.media}
        alt={`Media ${index + 1}`}
        className="w-full h-full object-cover"
      />
    );
  };

  return (
    <div className="border rounded-md p-4 bg-white dark:bg-gray-950">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
            {activeSocial?.profilePic ? (
              <img
                src={activeSocial.profilePic}
                alt={activeSocial.name || "Social platform"}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <h3 className="font-semibold">{activeSocial?.name || "Preview"}</h3>
            <p className="text-sm text-muted-foreground">Post Preview</p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onEditCustom(activeTab)}
          className="flex items-center gap-1"
        >
          <Edit2 className="h-4 w-4" /> Edit Custom
        </Button>
      </div>

      <div className="min-h-[300px] pr-3">
        {posts.map((post, index) => (
          <div key={post.id} className="mb-4">
            {index > 0 && (
              <div className="h-px bg-gray-200 dark:bg-gray-800 my-4"></div>
            )}
            <p className="whitespace-pre-wrap mb-2">
              {post.text || "Your post content will appear here..."}
            </p>

            {post.media.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {post.media.map((item, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-md bg-gray-100 dark:bg-gray-800"
                  >
                    {item.media && renderMedia(item, i)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 