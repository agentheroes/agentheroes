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
import { ArrowUp, ArrowDown, Plus, Trash2, User, Edit2, ArrowLeft } from "lucide-react";
import { TextareaWithMedia } from "@frontend/components/ui/textarea-with-media";
import { Media } from "@frontend/types/media";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@frontend/components/ui/tabs";
import { Label } from "@frontend/components/ui/label";
import { useToast } from "@frontend/hooks/use-toast";
import {useFetch} from "@frontend/hooks/use-fetch";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

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

// Interface for channel-specific content
interface ChannelContent {
  channelId: string;
  posts: PostContent[];
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
  activeTab,
  onEditCustom 
}: { 
  posts: PostContent[], 
  channels: string[],
  activeTab: string,
  onEditCustom: (channelId: string) => void
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

// Custom Post Editor component for editing channel-specific content
function CustomPostEditor({
  channelId,
  posts,
  onChange,
  onBack,
  socials
}: {
  channelId: string,
  posts: PostContent[],
  onChange: (posts: PostContent[]) => void,
  onBack: () => void,
  socials: any[]
}) {
  const activeSocial = socials.find(social => social.id === channelId);

  const handlePostChange = (id: string, text: string, media: Media[]) => {
    onChange(posts.map(post => post.id === id ? { ...post, text, media } : post));
  };

  const handleMovePost = (index: number, direction: 'up' | 'down') => {
    const newPosts = [...posts];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap posts
    const temp = newPosts[index];
    newPosts[index] = newPosts[newIndex];
    newPosts[newIndex] = temp;
    
    onChange(newPosts);
  };

  const handleDeletePost = (index: number) => {
    // Don't allow deleting the last post
    if (posts.length === 1) return;
    
    const newPosts = [...posts];
    newPosts.splice(index, 1);
    onChange(newPosts);
  };

  const handleAddPost = () => {
    onChange([...posts, { id: crypto.randomUUID(), text: "", media: [] }]);
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Button 
            type="button" 
            size="sm" 
            variant="ghost" 
            onClick={onBack}
            className="h-8 w-8 !p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            {activeSocial?.profilePic ? (
              <img 
                src={activeSocial.profilePic} 
                alt={activeSocial.name || "Social platform"} 
                className="h-6 w-6 rounded-full"
              />
            ) : (
              <User className="h-5 w-5 text-primary" />
            )}
            <h3 className="font-medium">
              Editing content for {activeSocial?.name || channelId}
            </h3>
          </div>
        </div>
      </div>

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
  );
}

// This wrapper component ensures the context is available
function PostDialogContent({ open, onOpenChange, date }: PostDialogProps) {
  const [globalPosts, setGlobalPosts] = useState<PostContent[]>([
    { id: crypto.randomUUID(), text: "", media: [] }
  ]);
  const [customChannelContents, setCustomChannelContents] = useState<ChannelContent[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [activePreviewTab, setActivePreviewTab] = useState<string>("");
  const [editingCustomChannel, setEditingCustomChannel] = useState<string | null>(null);
  const [postType, setPostType] = useState<'schedule' | 'draft'>('schedule');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { socials } = useSocialMedia();
  const { toast } = useToast();
  const fetch = useFetch();

  // Set the first selected channel as active preview tab
  useEffect(() => {
    if (selectedChannels.length > 0 && !selectedChannels.includes(activePreviewTab)) {
      setActivePreviewTab(selectedChannels[0]);
    }
  }, [selectedChannels, activePreviewTab]);

  // Helper to get posts for a specific channel (either custom or global)
  const getPostsForChannel = (channelId: string): PostContent[] => {
    const customContent = customChannelContents.find(content => content.channelId === channelId);
    return customContent ? customContent.posts : globalPosts;
  };
  
  // Check if a channel has custom content
  const hasCustomContent = (channelId: string): boolean => {
    return customChannelContents.some(content => content.channelId === channelId);
  };

  const handleAddPost = () => {
    setGlobalPosts([...globalPosts, { id: crypto.randomUUID(), text: "", media: [] }]);
  };

  const handlePostChange = (id: string, text: string, media: Media[]) => {
    setGlobalPosts(globalPosts.map(post => post.id === id ? { ...post, text, media } : post));
  };

  const handleMovePost = (index: number, direction: 'up' | 'down') => {
    const newPosts = [...globalPosts];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap posts
    const temp = newPosts[index];
    newPosts[index] = newPosts[newIndex];
    newPosts[newIndex] = temp;
    
    setGlobalPosts(newPosts);
  };

  const handleDeletePost = (index: number) => {
    // Don't allow deleting the last post
    if (globalPosts.length === 1) return;
    
    const newPosts = [...globalPosts];
    newPosts.splice(index, 1);
    setGlobalPosts(newPosts);
  };

  // Start editing custom content for a channel
  const handleEditCustom = (channelId: string) => {
    // If no custom content exists yet for this channel, create it based on global posts
    if (!hasCustomContent(channelId)) {
      // Deep clone the global posts to avoid reference issues
      const clonedPosts = globalPosts.map(post => ({
        id: crypto.randomUUID(),
        text: post.text,
        media: [...post.media] // Clone the media array
      }));
      
      setCustomChannelContents([
        ...customChannelContents,
        { channelId, posts: clonedPosts }
      ]);
    }
    
    setEditingCustomChannel(channelId);
  };

  // Update custom content for a channel
  const handleCustomContentChange = (posts: PostContent[]) => {
    if (!editingCustomChannel) return;
    
    setCustomChannelContents(
      customChannelContents.map(content => 
        content.channelId === editingCustomChannel
          ? { ...content, posts }
          : content
      )
    );
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Format the data according to the required structure
      const formattedData = {
        date: dayjs(date).utc().format('YYYY-MM-DDTHH:mm:ss'), // Format as YYYY-MM-DD
        type: postType,
        list: selectedChannels.map(channelId => {
          const posts = getPostsForChannel(channelId);
          
          return {
            channel: channelId,
            posts: posts
              .filter(post => post.text.trim() !== '') // Filter out empty posts
              .map((post, index) => ({
                order: index + 1,
                text: post.text,
                media: post.media.map(mediaItem => 
                  typeof mediaItem.media === 'string' ? mediaItem.media : mediaItem.media
                )
              }))
          };
        }).filter(item => item.posts.length > 0) // Filter out channels with no posts
      };
      
      // Send the POST request
      const response = await fetch('/socials/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const result = await response.json();
      toast({
        title: "Success",
        description: "Post created successfully",
      });
      
      // Reset form and close dialog
      setGlobalPosts([{ id: crypto.randomUUID(), text: "", media: [] }]);
      setCustomChannelContents([]);
      setSelectedChannels([]);
      setEditingCustomChannel(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = (
    (globalPosts.some(post => post.text.trim().length > 0) || 
     customChannelContents.some(content => content.posts.some(post => post.text.trim().length > 0))
    ) && selectedChannels.length > 0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Add New Post</DialogTitle>
          <DialogDescription>
            {date ? `Create a post for ${date.toLocaleString()}` : "Create a new post"}
          </DialogDescription>
        </DialogHeader>
        
        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - Post form */}
          <div className="flex flex-col gap-4">
            {/* Social Media Channel Selector */}
            <SocialMediaChannelSelector 
              selectedChannels={selectedChannels}
              onChange={setSelectedChannels}
            />
            
            {/* Post Type Selector */}
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">Post Type</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="schedule"
                    name="postType"
                    value="schedule"
                    checked={postType === 'schedule'}
                    onChange={() => setPostType('schedule')}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="schedule">Schedule</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="draft"
                    name="postType"
                    value="draft"
                    checked={postType === 'draft'}
                    onChange={() => setPostType('draft')}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="draft">Draft</Label>
                </div>
              </div>
            </div>
            
            {/* Display channel-specific editor or global editor */}
            {editingCustomChannel ? (
              <CustomPostEditor
                channelId={editingCustomChannel}
                posts={getPostsForChannel(editingCustomChannel)}
                onChange={handleCustomContentChange}
                onBack={() => setEditingCustomChannel(null)}
                socials={socials}
              />
            ) : (
              <div className="grid gap-4">
                <label className="text-sm font-medium">
                  Post Content (All Channels)
                </label>
                
                {/* Multiple Post Textareas */}
                <div className="space-y-3">
                  {globalPosts.map((post, index) => (
                    <PostTextArea
                      key={post.id}
                      post={post}
                      onChange={handlePostChange}
                      onMoveUp={() => handleMovePost(index, 'up')}
                      onMoveDown={() => handleMovePost(index, 'down')}
                      onDelete={() => handleDeletePost(index)}
                      canMoveUp={index > 0}
                      canMoveDown={index < globalPosts.length - 1}
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
            )}
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
                      const hasCustom = hasCustomContent(channelId);
                      
                      return (
                        <TabsTrigger value={channelId} key={channelId} className="flex items-center gap-2">
                          {social?.profilePic && (
                            <img src={social.profilePic} alt={social.name} className="w-4 h-4" />
                          )}
                          {social?.name}
                          {hasCustom && (
                            <span className="h-1.5 w-1.5 bg-primary rounded-full" title="Has custom content" />
                          )}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                  
                  {selectedChannels.map(channelId => (
                    <TabsContent value={channelId} key={channelId}>
                      <PostPreview 
                        posts={getPostsForChannel(channelId)} 
                        channels={selectedChannels}
                        activeTab={channelId}
                        onEditCustom={handleEditCustom}
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
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Post"}
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