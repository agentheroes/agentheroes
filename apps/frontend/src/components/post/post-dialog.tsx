"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@frontend/components/ui/dialog";
import { Button } from "@frontend/components/ui/button";
import { SocialMediaChannelSelector } from "./social-media-channel-selector";
import { useSocialMedia, SocialMediaProvider } from "../calendar/SocialMediaContext";
import { ArrowUp, ArrowDown, Plus, Trash2, User } from "lucide-react";
import { TextareaWithMedia } from "@frontend/components/ui/textarea-with-media";
import { Media } from "@frontend/types/media";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@frontend/components/ui/tabs";

interface PostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date?: Date;
}

interface PostContent {
  id: string;
  text: string;
  media: Media[];
}

// Post textarea component with reordering buttons
function PostTextArea({ 
  post, 
  onChange, 
  onMoveUp, 
  onMoveDown, 
  onDelete,
  canMoveUp,
  canMoveDown
}: { 
  post: PostContent, 
  onChange: (id: string, text: string, media: Media[]) => void,
  onMoveUp: () => void,
  onMoveDown: () => void,
  onDelete: () => void,
  canMoveUp: boolean,
  canMoveDown: boolean
}) {
  return (
    <div className="flex gap-2">
      <div className="flex flex-col gap-2">
        <Button 
          type="button" 
          size="sm" 
          variant="outline" 
          onClick={onMoveUp}
          disabled={!canMoveUp}
          className="h-8 w-8 !p-0"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          size="sm" 
          variant="outline" 
          onClick={onMoveDown}
          disabled={!canMoveDown}
          className="h-8 w-8 !p-0"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1">
        <TextareaWithMedia
          value={post.text}
          onChange={(text) => onChange(post.id, text, post.media)}
          selectedMedia={post.media}
          onMediaChange={(media) => onChange(post.id, post.text, media)}
          maxMediaSelections={5}
          placeholder="Write your post content here..."
        />
      </div>
      <Button 
        type="button" 
        size="sm" 
        variant="outline" 
        onClick={onDelete}
        className="h-8 w-8 !p-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Post preview component that displays how the post will look on social media
function PostPreview({ 
  posts, 
  channels,
  activeTab
}: { 
  posts: PostContent[], 
  channels: string[],
  activeTab: string 
}) {
  const { socials } = useSocialMedia();
  const [playingVideos, setPlayingVideos] = useState<Record<string, boolean>>({});
  
  // Find selected social platform
  const activeSocial = socials.find(social => social.id === activeTab);
  
  // Handle video play on hover
  const handleVideoMouseEnter = (videoElement: HTMLVideoElement, videoId: string) => {
    if (!videoElement) return;

    // Mark this video as attempting to play
    setPlayingVideos(prev => ({ ...prev, [videoId]: true }));
    
    // Reset to the beginning if it was previously played
    if (videoElement.currentTime > 0) {
      videoElement.currentTime = 0;
    }
    
    // Handle the play Promise properly to avoid AbortError
    const playPromise = videoElement.play();
    
    // Not all browsers return a promise from play()
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        // Only log errors other than AbortError
        if (error.name !== 'AbortError') {
          console.error("Error playing video:", error);
        }
      });
    }
  };

  // Handle video pause on mouse leave
  const handleVideoMouseLeave = (videoElement: HTMLVideoElement, videoId: string) => {
    if (!videoElement) return;
    
    // Mark this video as no longer playing
    setPlayingVideos(prev => ({ ...prev, [videoId]: false }));
    
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
    const isVideo = item.type === "VIDEO" || 
                    (typeof item.media === 'string' && 
                     /\.(mp4|webm|ogg)$/i.test(item.media));
    
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
      <div className="flex items-center gap-3 mb-4">
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
      
      <div className="min-h-[300px] pr-3">
        {posts.map((post, index) => (
          <div key={post.id} className="mb-4">
            {index > 0 && <div className="h-px bg-gray-200 dark:bg-gray-800 my-4"></div>}
            <p className="whitespace-pre-wrap mb-2">{post.text || "Your post content will appear here..."}</p>
            
            {post.media.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {post.media.map((item, i) => (
                  <div key={i} className="relative aspect-square rounded-md bg-gray-100 dark:bg-gray-800">
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

// This wrapper component ensures the context is available
function PostDialogContent({ open, onOpenChange, date }: PostDialogProps) {
  const [posts, setPosts] = useState<PostContent[]>([
    { id: crypto.randomUUID(), text: "", media: [] }
  ]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [activePreviewTab, setActivePreviewTab] = useState<string>("");
  const { socials } = useSocialMedia();

  // Set the first selected channel as active preview tab
  useEffect(() => {
    if (selectedChannels.length > 0 && !selectedChannels.includes(activePreviewTab)) {
      setActivePreviewTab(selectedChannels[0]);
    }
  }, [selectedChannels, activePreviewTab]);

  const handleAddPost = () => {
    setPosts([...posts, { id: crypto.randomUUID(), text: "", media: [] }]);
  };

  const handlePostChange = (id: string, text: string, media: Media[]) => {
    setPosts(posts.map(post => post.id === id ? { ...post, text, media } : post));
  };

  const handleMovePost = (index: number, direction: 'up' | 'down') => {
    const newPosts = [...posts];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap posts
    const temp = newPosts[index];
    newPosts[index] = newPosts[newIndex];
    newPosts[newIndex] = temp;
    
    setPosts(newPosts);
  };

  const handleDeletePost = (index: number) => {
    // Don't allow deleting the last post
    if (posts.length === 1) return;
    
    const newPosts = [...posts];
    newPosts.splice(index, 1);
    setPosts(newPosts);
  };

  const handleSubmit = () => {
    // Implement submission logic here
    // This could be a post creation API call
    console.log("Creating posts:", posts);
    console.log("For date:", date);
    console.log("Selected channels:", selectedChannels);
    
    // Reset form and close dialog
    setPosts([{ id: crypto.randomUUID(), text: "", media: [] }]);
    setSelectedChannels([]);
    onOpenChange(false);
  };

  const isFormValid = posts.some(post => post.text.trim().length > 0) && selectedChannels.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Add New Post</DialogTitle>
          <DialogDescription>
            {date ? `Create a post for ${date.toLocaleDateString()}` : "Create a new post"}
          </DialogDescription>
        </DialogHeader>
        
        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - Post form */}
          <div className="grid gap-4">
            {/* Social Media Channel Selector */}
            <SocialMediaChannelSelector 
              selectedChannels={selectedChannels}
              onChange={setSelectedChannels}
            />
            
            <div className="grid gap-4">
              <label className="text-sm font-medium">
                Post Content
              </label>
              
              {/* Multiple Post Textareas */}
              <div className="space-y-3">
                {posts.map((post, index) => (
                  <PostTextArea
                    key={post.id}
                    post={post}
                    onChange={handlePostChange}
                    onMoveUp={() => handleMovePost(index, 'up')}
                    onMoveDown={() => handleMovePost(index, 'down')}
                    onDelete={() => handleDeletePost(index)}
                    canMoveUp={index > 0}
                    canMoveDown={index < posts.length - 1}
                  />
                ))}
              </div>
              
              {/* Add Post Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddPost}
                className="flex items-center gap-1 mr-auto"
              >
                <Plus className="h-4 w-4" /> Add Another Post
              </Button>
            </div>
          </div>

          {/* Right column - Preview */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Preview
            </label>
            
            {selectedChannels.length > 0 ? (
              <div className="grid gap-4">
                <Tabs 
                  value={activePreviewTab || selectedChannels[0]} 
                  onValueChange={setActivePreviewTab}
                >
                  <TabsList className="mb-4">
                    {selectedChannels.map(channelId => {
                      const social = socials.find(s => s.id === channelId);
                      return (
                        <TabsTrigger value={channelId} key={channelId} className="flex items-center gap-2">
                          {social?.profilePic && (
                            <img src={social.profilePic} alt={social.name} className="w-4 h-4" />
                          )}
                          {social?.name}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                  
                  {selectedChannels.map(channelId => (
                    <TabsContent value={channelId} key={channelId}>
                      <PostPreview 
                        posts={posts} 
                        channels={selectedChannels}
                        activeTab={channelId} 
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            ) : (
              <div className="border rounded-md p-6 flex flex-col items-center justify-center h-[350px] bg-muted/20">
                <p className="text-muted-foreground text-center">
                  Select at least one social media channel to see a preview of your post
                </p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={!isFormValid}
          >
            Create Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Main component that wraps the content with the provider
export function PostDialog(props: PostDialogProps) {
  return (
    <SocialMediaProvider>
      <PostDialogContent {...props} />
    </SocialMediaProvider>
  );
} 