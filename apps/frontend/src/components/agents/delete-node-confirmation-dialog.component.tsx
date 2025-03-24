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
import { NodeButton } from "@frontend/components/agents/node-button.component";
import { cn } from "@frontend/lib/utils";
import {Button} from "@frontend/components/ui/button";

interface DeleteNodeConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nodeName: string;
  hasChildren: boolean;
}

export const DeleteNodeConfirmationDialog: FC<DeleteNodeConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  nodeName,
  hasChildren
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border border-[#1F1F1F] bg-[#0D0D0D] p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white">Delete {nodeName} Node</DialogTitle>
          <DialogDescription className="text-gray-400">
            {hasChildren 
              ? `Are you sure you want to delete this node? This will also delete all child nodes connected to it.`
              : `Are you sure you want to delete this node?`
            }
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="mt-4">
          <div className="flex justify-end space-x-2 w-full">
            <NodeButton onClick={onClose} variant="outline">
              Cancel
            </NodeButton>
            <div className="bg-red-600 hover:bg-red-700 rounded-md">
              <Button onClick={onConfirm} variant="destructive" className="text-white">
                Delete
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 