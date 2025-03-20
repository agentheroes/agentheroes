"use client";

import { FC } from "react";
import { TreeState } from "./store";
import { NodeConfigFactory } from "./node-config-factory.component";

interface NodeConfigurationDialogProps {
  isOpen: boolean;
  node: TreeState | null;
  onClose: () => void;
}

export const NodeConfigurationDialog: FC<NodeConfigurationDialogProps> = ({
  isOpen,
  node,
  onClose,
}) => {
  if (!isOpen || !node) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <NodeConfigFactory node={node} onClose={onClose} />
      </div>
    </div>
  );
}; 