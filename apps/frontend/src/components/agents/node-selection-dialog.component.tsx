"use client";

import { FC, useState, useEffect } from "react";
import { AgentNode, NodeType, steps } from "@packages/shared/agents/agent.flow";
import { NodeIcon } from "./node-icon.component";
import { NodeButton } from "./node-button.component";
import { TreeState } from "./store";

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
          <h3 className="text-lg font-medium text-white">Select Node Type</h3>
          <p className="text-xs text-blue-100 mt-1">Adding after: {steps.find(s => s.type === currentNodeType)?.name}</p>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Select the type of node you want to add:
          </p>
          
          <div className="space-y-3">
            {availableNodeTypes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No available node types to add
              </p>
            ) : (
              availableNodeTypes.map((node) => (
                <div 
                  key={node.type}
                  onClick={() => onSelectNode(node.type)}
                  className="flex items-center p-3 rounded-md hover:bg-gray-50 cursor-pointer border border-gray-200 transition-colors"
                >
                  <NodeIcon type={node.type} />
                  <span className="ml-3 font-medium text-gray-600">{node.name}</span>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-6 flex justify-end">
            <NodeButton onClick={onClose} variant="ghost">
              Cancel
            </NodeButton>
          </div>
        </div>
      </div>
    </div>
  );
}; 