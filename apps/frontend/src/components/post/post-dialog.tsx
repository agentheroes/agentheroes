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
import { ArrowUp, ArrowDown, Plus, Trash2 } from "lucide-react";

interface PostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date?: Date;
}

interface PostContent {
  id: string;
  text: string;
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
  onChange: (id: string, text: string) => void,
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
      <textarea
        value={post.text}
        onChange={(e) => onChange(post.id, e.target.value)}
        className="flex h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        placeholder="Write your post content here..."
      />
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

// This wrapper component ensures the context is available
function PostDialogContent({ open, onOpenChange, date }: PostDialogProps) {
  const [posts, setPosts] = useState<PostContent[]>([
    { id: crypto.randomUUID(), text: "" }
  ]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const { socials } = useSocialMedia();

  const handleAddPost = () => {
    setPosts([...posts, { id: crypto.randomUUID(), text: "" }]);
  };

  const handlePostChange = (id: string, text: string) => {
    setPosts(posts.map(post => post.id === id ? { ...post, text } : post));
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
    console.log("Creating posts:", posts.map(p => p.text));
    console.log("For date:", date);
    console.log("Selected channels:", selectedChannels);
    
    // Reset form and close dialog
    setPosts([{ id: crypto.randomUUID(), text: "" }]);
    setSelectedChannels([]);
    onOpenChange(false);
  };

  const isFormValid = posts.some(post => post.text.trim().length > 0) && selectedChannels.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Post</DialogTitle>
          <DialogDescription>
            {date ? `Create a post for ${date.toLocaleDateString()}` : "Create a new post"}
          </DialogDescription>
        </DialogHeader>
        
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