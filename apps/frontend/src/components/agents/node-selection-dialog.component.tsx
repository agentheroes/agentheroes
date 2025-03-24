"use client";

import { FC, useState, useEffect } from "react";
import { AgentNode, NodeType, steps } from "@packages/shared/agents/agent.flow";
import { NodeIcon } from "./node-icon.component";
import { NodeButton } from "./node-button.component";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@frontend/components/ui/dialog";

interface NodeSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNode: (nodeType: NodeType) => void;
  currentNodeType: NodeType;
}

export const NodeSelectionDialog: FC<NodeSelectionDialogProps> = ({
  isOpen,
  onClose,
  onSelectNode,
  currentNodeType,
}) => {
  const [availableNodeTypes, setAvailableNodeTypes] = useState<AgentNode[]>([]);

  useEffect(() => {
    // Filter nodes based on the dependencies
    // Current node type must be in the dependsOn array of available nodes
    const filteredNodes = steps.filter((step) => 
      step.dependsOn.includes(currentNodeType) && step.type !== currentNodeType
    );
    
    setAvailableNodeTypes(filteredNodes);
  }, [currentNodeType]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border border-[#1F1F1F] bg-[#0D0D0D] p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white">Select Node Type</DialogTitle>
          <DialogDescription className="text-gray-400">
            Adding after: {steps.find(s => s.type === currentNodeType)?.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-1">
          <div className="space-y-3 py-4">
            {availableNodeTypes.length === 0 ? (
              <p className="text-center py-4 text-gray-400">
                No available node types to add
              </p>
            ) : (
              availableNodeTypes.map((node) => (
                <div 
                  key={node.type}
                  onClick={() => onSelectNode(node.type)}
                  className="flex items-center p-4 rounded-xl hover:bg-[#121212] cursor-pointer border border-[#2A2A2A] transition-colors"
                >
                  <NodeIcon type={node.type} />
                  <span className="ml-3 font-medium">{node.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
        
        <DialogFooter className="mt-2">
          <NodeButton onClick={onClose} variant="outline">
            Cancel
          </NodeButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 