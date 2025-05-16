"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import { CreditsDialog } from "@frontend/components/credits/credits-dialog";

interface CreditsDialogContextProps {
  openCreditsDialog: () => void;
  closeCreditsDialog: () => void;
}

const CreditsDialogContext = createContext<CreditsDialogContextProps | undefined>(undefined);

export function useCreditsDialog() {
  const context = useContext(CreditsDialogContext);
  if (!context) {
    throw new Error("useCreditsDialog must be used within a CreditsDialogProvider");
  }
  return context;
}

interface CreditsDialogProviderProps {
  children: ReactNode;
}

export function CreditsDialogProvider({ children }: CreditsDialogProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openCreditsDialog = () => {
    setIsOpen(true);
  };

  const closeCreditsDialog = () => {
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <CreditsDialogContext.Provider value={{ openCreditsDialog, closeCreditsDialog }}>
      {children}
      <CreditsDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
      />
    </CreditsDialogContext.Provider>
  );
} 