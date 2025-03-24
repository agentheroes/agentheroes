"use client";

import { FC } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@frontend/components/ui/dialog";
import { Button } from "@frontend/components/ui/button";

interface DeleteAgentConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  agentName: string;
  isDeleting: boolean;
}

export const DeleteAgentConfirmationDialog: FC<DeleteAgentConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  agentName,
  isDeleting
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border border-[#1F1F1F] bg-[#0D0D0D] p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white">Delete Agent</DialogTitle>
          <DialogDescription className="text-gray-400">
            Are you sure you want to delete the agent "{agentName}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="mt-4">
          <div className="flex justify-end space-x-2 w-full">
            <Button 
              onClick={onClose} 
              variant="outline" 
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              onClick={onConfirm} 
              variant="destructive"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 