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
import { useSocialMedia } from "../calendar/social.media.context";
import { useCalendar } from "../calendar/calendar.context";
import { Plus } from "lucide-react";
import { Media } from "@frontend/types/media";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@frontend/components/ui/tabs";
import { Label } from "@frontend/components/ui/label";
import { useToast } from "@frontend/hooks/use-toast";
import { useFetch } from "@frontend/hooks/use-fetch";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  CustomPostEditor,
  PostTextArea,
  PostContent,
} from "./custom-post-editor";
import { PostPreview } from "./post-preview";
import { SelectableChannelItem } from "@frontend/components/post/selectable-channel-item";
import { DatePicker } from "@frontend/components/post/date-picker";

dayjs.extend(utc);

interface PostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date?: Date;
  isEditing?: boolean;
  groupId?: string;
  channelId?: string;
}

// Interface for channel-specific content
interface ChannelContent {
  channelId: string;
  posts: PostContent[];
}

// This wrapper component ensures the context is available
function PostDialogContent({
  open,
  onOpenChange,
  date,
  isEditing = false,
  groupId,
  channelId,
}: PostDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date);
  const [globalPosts, setGlobalPosts] = useState<PostContent[]>([
    { id: crypto.randomUUID(), text: "", media: [] },
  ]);
  const [customChannelContents, setCustomChannelContents] = useState<
    ChannelContent[]
  >([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [activePreviewTab, setActivePreviewTab] = useState<string>("");
  const [editingCustomChannel, setEditingCustomChannel] = useState<
    string | null
  >(null);
  const [postType, setPostType] = useState<"schedule" | "draft" | "now">("schedule");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const { socials } = useSocialMedia();
  const { refreshEvents } = useCalendar();
  const { toast } = useToast();
  const fetch = useFetch();

  // Update selectedDate when the date prop changes
  useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  // Fetch post data when editing
  useEffect(() => {
    if (isEditing && groupId && open) {
      const fetchPostData = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/socials/calendar/${groupId}`);

          if (!response.ok) {
            throw new Error(`Error fetching post data: ${response.status}`);
          }

          const postData = await response.json();

          if (postData && postData.length > 0) {
            // Set post type from the first item
            setPostType(postData[0].type as "schedule" | "draft" | "now");

            // Transform API data to our format
            const formattedPosts = postData.map((post: any) => ({
              id: post.id,
              text: post.content,
              media: post.media.map((url: string) => {
                // Determine media type based on URL extension
                const isVideo = /\.(mp4|mov|avi|webm)$/i.test(url);
                return {
                  id: crypto.randomUUID(),
                  media: url,
                  type: isVideo ? "VIDEO" : "IMAGE",
                };
              }),
            }));

            // Set the posts and selected channel
            setGlobalPosts(formattedPosts);

            if (channelId) {
              setSelectedChannels([channelId]);
              setActivePreviewTab(channelId);
            }
          }
        } catch (error) {
          console.error("Error fetching post data:", error);
          toast({
            title: "Error",
            description: "Failed to load post data for editing.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchPostData();
    }
  }, [isEditing, groupId, channelId, open, fetch, toast]);

  // Set the first selected channel as active preview tab
  useEffect(() => {
    if (
      selectedChannels.length > 0 &&
      !selectedChannels.includes(activePreviewTab)
    ) {
      setActivePreviewTab(selectedChannels[0]);
    }
  }, [selectedChannels, activePreviewTab]);

  // Helper to get posts for a specific channel (either custom or global)
  const getPostsForChannel = (channelId: string): PostContent[] => {
    const customContent = customChannelContents.find(
      (content) => content.channelId === channelId,
    );
    return customContent ? customContent.posts : globalPosts;
  };

  // Check if a channel has custom content
  const hasCustomContent = (channelId: string): boolean => {
    return customChannelContents.some(
      (content) => content.channelId === channelId,
    );
  };

  const handleAddPost = () => {
    setGlobalPosts([
      ...globalPosts,
      { id: crypto.randomUUID(), text: "", media: [] },
    ]);
  };

  const handlePostChange = (id: string, text: string, media: Media[]) => {
    setGlobalPosts(
      globalPosts.map((post) =>
        post.id === id ? { ...post, text, media } : post,
      ),
    );
  };

  const handleMovePost = (index: number, direction: "up" | "down") => {
    const newPosts = [...globalPosts];
    const newIndex = direction === "up" ? index - 1 : index + 1;

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
      const clonedPosts = globalPosts.map((post) => ({
        id: crypto.randomUUID(),
        text: post.text,
        media: [...post.media], // Clone the media array
      }));

      setCustomChannelContents([
        ...customChannelContents,
        { channelId, posts: clonedPosts },
      ]);
    }

    setEditingCustomChannel(channelId);
  };

  // Update custom content for a channel
  const handleCustomContentChange = (posts: PostContent[]) => {
    if (!editingCustomChannel) return;

    setCustomChannelContents(
      customChannelContents.map((content) =>
        content.channelId === editingCustomChannel
          ? { ...content, posts }
          : content,
      ),
    );
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Use the selectedDate from our state instead of the date prop
      const formattedData: {
        date: string;
        type: "schedule" | "draft" | "now";
        list: {
          channel: string;
          posts: {
            id?: string; // Make ID optional for new posts
            order: number;
            text: string;
            media: string[];
          }[];
        }[];
        group?: string; // Add optional group property for editing
      } = {
        date: dayjs(selectedDate).utc().format("YYYY-MM-DDTHH:mm:ss"),
        type: postType,
        list: selectedChannels
          .map((channelId) => {
            const posts = getPostsForChannel(channelId);

            return {
              channel: channelId,
              posts: posts
                .filter((post) => post.text.trim() !== "") // Filter out empty posts
                .map((post, index) => ({
                  // Include the post ID when editing
                  ...(isEditing && { id: post.id }),
                  order: index + 1,
                  text: post.text,
                  media: post.media.map((mediaItem) =>
                    typeof mediaItem.media === "string"
                      ? mediaItem.media
                      : mediaItem.media,
                  ),
                })),
            };
          })
          .filter((item) => item.posts.length > 0), // Filter out channels with no posts
      };

      // Add group ID if editing
      if (isEditing && groupId) {
        formattedData.group = groupId;
      }

      // Use the same endpoint and method for both creating and updating
      const response = await fetch("/socials/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Refresh the calendar events to update the UI
      try {
        await refreshEvents();
        console.log("Calendar events refreshed successfully");
      } catch (refreshError) {
        console.error("Failed to refresh calendar events:", refreshError);
        // Continue with success flow even if calendar refresh fails
      }

      toast({
        title: "Success",
        description: isEditing
          ? "Post updated successfully"
          : "Post created successfully",
      });

      // Reset form and close dialog
      setGlobalPosts([{ id: crypto.randomUUID(), text: "", media: [] }]);
      setCustomChannelContents([]);
      setSelectedChannels([]);
      setEditingCustomChannel(null);
      onOpenChange(false);
    } catch (error) {
      console.error(
        isEditing ? "Error updating post:" : "Error creating post:",
        error,
      );
      toast({
        title: "Error",
        description: isEditing
          ? "Failed to update post. Please try again."
          : "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for the Post Now button
  const handlePostNow = async () => {
    try {
      setIsSubmitting(true);

      // Format the data according to the required structure, but with current date and "now" type
      const formattedData: {
        date: string;
        type: "schedule" | "draft" | "now"; // Using "now" type for immediate posting
        list: {
          channel: string;
          posts: {
            id?: string;
            order: number;
            text: string;
            media: string[];
          }[];
        }[];
        group?: string;
      } = {
        date: dayjs().utc().format("YYYY-MM-DDTHH:mm:ss"),
        type: "schedule",
        list: selectedChannels
          .map((channelId) => {
            const posts = getPostsForChannel(channelId);

            return {
              channel: channelId,
              posts: posts
                .filter((post) => post.text.trim() !== "") // Filter out empty posts
                .map((post, index) => ({
                  // Include the post ID when editing
                  ...(isEditing && { id: post.id }),
                  order: index + 1,
                  text: post.text,
                  media: post.media.map((mediaItem) =>
                    typeof mediaItem.media === "string"
                      ? mediaItem.media
                      : mediaItem.media,
                  ),
                })),
            };
          })
          .filter((item) => item.posts.length > 0), // Filter out channels with no posts
      };

      // Add group ID if editing
      if (isEditing && groupId) {
        formattedData.group = groupId;
      }

      // Use the same endpoint and method for both creating and updating
      const response = await fetch("/socials/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Refresh the calendar events to update the UI
      try {
        await refreshEvents();
        console.log("Calendar events refreshed successfully");
      } catch (refreshError) {
        console.error("Failed to refresh calendar events:", refreshError);
        // Continue with success flow even if calendar refresh fails
      }

      toast({
        title: "Success",
        description: "Post published immediately",
      });

      // Reset form and close dialog
      setGlobalPosts([{ id: crypto.randomUUID(), text: "", media: [] }]);
      setCustomChannelContents([]);
      setSelectedChannels([]);
      setEditingCustomChannel(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Error posting immediately:", error);
      toast({
        title: "Error",
        description: "Failed to publish post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePostGroup = async () => {
    if (!groupId) return;
    
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/socials/calendar/${groupId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Refresh the calendar events to update the UI
      try {
        await refreshEvents();
        console.log("Calendar events refreshed successfully after deletion");
      } catch (refreshError) {
        console.error("Failed to refresh calendar events after deletion:", refreshError);
      }
      
      toast({
        title: "Success",
        description: "Post deleted successfully"
      });
      
      // Close dialogs
      setShowDeleteConfirmation(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isFormValid =
    (globalPosts.some((post) => post.text.trim().length > 0) ||
      customChannelContents.some((content) =>
        content.posts.some((post) => post.text.trim().length > 0),
      )) &&
    selectedChannels.length > 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Post" : "Add New Post"}</DialogTitle>
            <DialogDescription>
              {selectedDate
                ? `${isEditing ? "Edit" : "Create"} a post for ${selectedDate.toLocaleString()}`
                : `${isEditing ? "Edit" : "Create"} a new post`}
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-3">Loading post data...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column - Post form */}
              <div className="flex flex-col gap-4">
                {/* Social Media Channel Selector - disabled in edit mode */}
                {isEditing ? (
                  <SelectableChannelItem
                    isSelected={true}
                    channel={socials.find(p => p.id === channelId)!}
                    onToggle={() => {}}
                  />
                ) : (
                  <SocialMediaChannelSelector
                    selectedChannels={selectedChannels}
                    onChange={setSelectedChannels}
                  />
                )}

                {/* Date Picker */}
                <div className="mb-4">
                  <Label className="text-sm font-medium mb-2 block">
                    Schedule Date & Time
                  </Label>
                  <DatePicker 
                    selectedDate={selectedDate} 
                    onChange={setSelectedDate}
                    minDate={new Date()} // Prevent selecting dates in the past
                  />
                </div>

                {/* Post Type Selector */}
                <div className="mb-4">
                  <Label className="text-sm font-medium mb-2 block">
                    Post Type
                  </Label>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="schedule"
                        name="postType"
                        value="schedule"
                        checked={postType === "schedule"}
                        onChange={() => setPostType("schedule")}
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
                        checked={postType === "draft"}
                        onChange={() => setPostType("draft")}
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
                      Post Content {!isEditing && "(All Channels)"}
                    </label>

                    {/* Multiple Post Textareas */}
                    <div className="space-y-3">
                      {globalPosts.map((post, index) => (
                        <PostTextArea
                          key={post.id}
                          post={post}
                          onChange={handlePostChange}
                          onMoveUp={() => handleMovePost(index, "up")}
                          onMoveDown={() => handleMovePost(index, "down")}
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
                <label className="text-sm font-medium mb-2 block">Preview</label>

                {selectedChannels.length > 0 ? (
                  <div className="grid gap-4">
                    <Tabs
                      value={activePreviewTab || selectedChannels[0]}
                      onValueChange={setActivePreviewTab}
                    >
                      <TabsList className="mb-4">
                        {selectedChannels.map((channelId) => {
                          const social = socials.find((s) => s.id === channelId);
                          const hasCustom = hasCustomContent(channelId);

                          return (
                            <TabsTrigger
                              value={channelId}
                              key={channelId}
                              className="flex items-center gap-2"
                            >
                              {social?.profilePic && (
                                <img
                                  src={social.profilePic}
                                  alt={social.name}
                                  className="w-4 h-4"
                                />
                              )}
                              {social?.name}
                              {hasCustom && (
                                <span
                                  className="h-1.5 w-1.5 bg-primary rounded-full"
                                  title="Has custom content"
                                />
                              )}
                            </TabsTrigger>
                          );
                        })}
                      </TabsList>

                      {selectedChannels.map((channelId) => (
                        <TabsContent value={channelId} key={channelId}>
                          <PostPreview
                            posts={getPostsForChannel(channelId)}
                            channels={selectedChannels}
                            activeTab={channelId}
                            onEditCustom={handleEditCustom}
                            socials={socials}
                          />
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                ) : (
                  <div className="border rounded-md p-6 flex flex-col items-center justify-center h-[350px] bg-muted/20">
                    <p className="text-muted-foreground text-center">
                      Select at least one social media channel to see a preview of
                      your post
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center w-full">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              {isEditing && groupId && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirmation(true)}
                  disabled={isDeleting || isLoading}
                >
                  Delete Post
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={handlePostNow}
                disabled={!isFormValid || isSubmitting || isLoading || isDeleting}
              >
                {isSubmitting ? "Posting..." : "Post Now"}
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting || isLoading || isDeleting}
              >
                {isSubmitting
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                    ? "Update Post"
                    : "Create Post"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConfirmation(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeletePostGroup}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Main component that wraps the content with the provider
export function PostDialog(props: PostDialogProps) {
  return <PostDialogContent {...props} />;
}
