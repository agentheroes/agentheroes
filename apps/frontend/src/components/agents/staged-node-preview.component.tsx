"use client";

import { FC, useEffect } from "react";
import { NodeType, steps } from "@packages/shared/agents/agent.flow";
import { NodeIcon } from "@frontend/components/agents/node-icon.component";
import { NodeButton } from "@frontend/components/agents/node-button.component";
import { nodeList } from "@frontend/components/agents/nodes/node.list";

interface StagedNodePreviewProps {
  nodeType: NodeType;
  nodeData: any;
  onConfirm: () => void;
  onCancel: () => void;
  isModal?: boolean;
  title?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

export const StagedNodePreview: FC<StagedNodePreviewProps> = ({
  nodeType,
  nodeData,
  onConfirm,
  onCancel,
  isModal = false,
  title = "Node Preview",
  confirmButtonText = "Confirm Node",
  cancelButtonText = "Cancel"
}) => {
  // Add logging for debugging
  useEffect(() => {
    console.log('StagedNodePreview rendered with:', { nodeType, nodeData, isModal });
  }, [nodeType, nodeData, isModal]);

  const nodeName = steps.find(s => s.type === nodeType)?.name || "Unknown";
  const nodeIdentifierTitle = nodeData?.nodeIdentifier ? 
    nodeList.find(n => n.identifier === nodeData.nodeIdentifier)?.title : null;

  const preview = (
    <>
      <div className="bg-[#121212] border border-[#2A2A2A] rounded-xl p-4 mb-4 relative">
        {title && <p className="text-sm text-[#FD7302] font-semibold mb-2">{title}</p>}
        <div className="flex items-center">
          <NodeIcon type={nodeType} />
          <span className="ml-2 text-sm font-medium">{nodeName}</span>
          {nodeIdentifierTitle && (
            <span className="ml-2 text-xs text-gray-400">
              ({nodeIdentifierTitle})
            </span>
          )}
        </div>
        <div className="absolute -top-3 right-3 bg-[#1A1A1A] text-[#FD7302] text-xs px-2 py-0.5 rounded-full font-medium border border-[#2A2A2A]">
          Pending
        </div>
      </div>
      <div className="text-sm text-gray-400 mb-4">
        This node will be added to your flow after confirmation.
      </div>
      <div className="flex gap-2">
        <NodeButton onClick={onConfirm} variant="default">
          {confirmButtonText}
        </NodeButton>
        <NodeButton onClick={onCancel} variant="outline">
          {cancelButtonText}
        </NodeButton>
      </div>
    </>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-[#0D0D0D] rounded-xl shadow-xl w-full max-w-md p-6 border border-[#1F1F1F]">
          <h3 className="text-lg font-semibold mb-4 text-white">{title}</h3>
          {preview}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col items-center w-full border border-[#2A2A2A] bg-[#0D0D0D] p-5 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-[#FD7302]">Pending Node Preview</h3>
      {preview}
    </div>
  );
}; 