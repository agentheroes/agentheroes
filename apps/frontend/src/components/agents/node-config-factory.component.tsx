"use client";

import { FC } from "react";
import { NodeType } from "@packages/shared/agents/agent.flow";
import { TreeState } from "./store";

// Import configuration components
import { TriggerConfig } from "./node-configs/trigger-config.component";
import { ThirdPartyConfig } from "./node-configs/third-party-config.component";
import { GenerateImage } from "./node-configs/generate-image.component";
import { GenerateVideoConfig } from "./node-configs/generate-video-config.component";
import { PublishConfig } from "./node-configs/publish-config.component";

// Helper function to build node path
const buildNodePath = (node: TreeState): string => {
  // Create a path based on node ID and parent ID if available
  return node.parent ? `${node.parent}/${node.id}` : node.id;
};

interface NodeConfigFactoryProps {
  node: TreeState;
  onClose: () => void;
}

export const NodeConfigFactory: FC<NodeConfigFactoryProps> = ({ node, onClose }) => {
  // Generate node path for use in workflow data
  const nodePath = buildNodePath(node);

  // Render the appropriate configuration component based on the node type
  switch (node.type) {
    case NodeType.TRIGGER:
      return (
        <TriggerConfig
          nodeId={node.id}
          initialData={node.data}
          onClose={onClose}
        />
      );
    case NodeType.THIRD_PARTY:
      return (
        <ThirdPartyConfig
          nodeId={node.id}
          initialData={node.data}
          nodePath={nodePath}
          onClose={onClose}
        />
      );
    case NodeType.GENERATE_IMAGE:
      return (
        <GenerateImage
          nodeId={node.id}
          nodePath={nodePath}
          onClose={onClose}
        />
      );
    case NodeType.GENERATE_VIDEO:
      return (
        <GenerateVideoConfig
          nodeId={node.id}
          initialData={node.data}
          onClose={onClose}
        />
      );
    case NodeType.PUBLISH:
      return (
        <PublishConfig
          nodeId={node.id}
          initialData={node.data}
          onClose={onClose}
        />
      );
    default:
      return (
        <div className="p-4">
          <h3 className="font-medium text-lg mb-4">Unsupported Node Type</h3>
          <p className="text-sm text-gray-600">
            Configuration for this node type is not supported.
          </p>
        </div>
      );
  }
}; 