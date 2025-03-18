"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import { PostDialog } from "./post-dialog";

interface PostDialogContextProps {
  openPostDialog: (date?: Date) => void;
  closePostDialog: () => void;
}

const PostDialogContext = createContext<PostDialogContextProps | undefined>(undefined);

export function usePostDialog() {
  const context = useContext(PostDialogContext);
  if (!context) {
    throw new Error("usePostDialog must be used within a PostDialogProvider");
  }
  return context;
}

interface PostDialogProviderProps {
  children: ReactNode;
}

export function PostDialogProvider({ children }: PostDialogProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const openPostDialog = (date?: Date) => {
    setSelectedDate(date);
    setIsOpen(true);
  };

  const closePostDialog = () => {
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset selected date when dialog closes
      setSelectedDate(undefined);
    }
  };

  return (
    <PostDialogContext.Provider value={{ openPostDialog, closePostDialog }}>
      {children}
      <PostDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        date={selectedDate}
      />
    </PostDialogContext.Provider>
  );
} 