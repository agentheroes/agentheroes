"use client";

import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@frontend/components/ui/dialog";
import { Button } from "@frontend/components/ui/button";

interface PostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date?: Date;
}

export function PostDialog({ open, onOpenChange, date }: PostDialogProps) {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    // Implement submission logic here
    // This could be a post creation API call
    console.log("Creating post with content:", content);
    console.log("For date:", date);
    
    // Reset form and close dialog
    setContent("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Post</DialogTitle>
          <DialogDescription>
            {date ? `Create a post for ${date.toLocaleDateString()}` : "Create a new post"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="post-content" className="text-sm font-medium">
              Post Content
            </label>
            <textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Write your post content here..."
            />
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
          <Button type="button" onClick={handleSubmit}>
            Create Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 