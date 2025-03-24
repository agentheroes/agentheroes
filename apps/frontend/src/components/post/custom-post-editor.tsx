"use client";

import * as React from "react";
import { Button } from "@frontend/components/ui/button";
import { ArrowLeft, Plus, ArrowUp, ArrowDown, Trash2, User } from "lucide-react";
import { TextareaWithMedia } from "@frontend/components/ui/textarea-with-media";
import { Media } from "@frontend/types/media";

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
  canMoveDown,
}: {
  post: PostContent;
  onChange: (id: string, text: string, media: Media[]) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
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

// Custom Post Editor component for editing channel-specific content
export function CustomPostEditor({
  channelId,
  posts,
  onChange,
  onBack,
  socials,
}: {
  channelId: string;
  posts: PostContent[];
  onChange: (posts: PostContent[]) => void;
  onBack: () => void;
  socials: any[];
}) {
  const activeSocial = socials.find((social) => social.id === channelId);

  const handlePostChange = (id: string, text: string, media: Media[]) => {
    onChange(
      posts.map((post) => (post.id === id ? { ...post, text, media } : post)),
    );
  };

  const handleMovePost = (index: number, direction: "up" | "down") => {
    const newPosts = [...posts];
    const newIndex = direction === "up" ? index - 1 : index + 1;

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
            onMoveUp={() => handleMovePost(index, "up")}
            onMoveDown={() => handleMovePost(index, "down")}
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

// Export the PostTextArea component for reuse
export { PostTextArea };
export type { PostContent }; 