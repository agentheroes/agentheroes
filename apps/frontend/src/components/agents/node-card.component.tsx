"use client";

import { FC, ReactNode } from "react";
import { NodeType } from "@packages/shared/agents/agent.flow";
import { TreeState } from "@frontend/components/agents/store";
import { NodeIcon } from "./node-icon.component";

interface NodeCardProps {
  node: TreeState;
  isRoot?: boolean;
  children?: ReactNode;
}

export const NodeCard: FC<NodeCardProps> = ({ node, isRoot = false, children }) => {
  // Determine node style based on type and whether it's a root node
  const getNodeColorScheme = () => {
    if (isRoot) {
      return "from-blue-500 to-purple-600 text-white";
    }

    switch (node.type) {
      case NodeType.TRIGGER:
        return "from-green-500 to-teal-600 text-white";
      case NodeType.THIRD_PARTY:
        return "from-orange-500 to-amber-600 text-white";
      case NodeType.GENERATE_IMAGE:
        return "from-purple-500 to-indigo-600 text-white";
      case NodeType.GENERATE_VIDEO:
        return "from-cyan-500 to-blue-600 text-white";
      case NodeType.PUBLISH:
        return "from-rose-500 to-pink-600 text-white";
      default:
        return "from-gray-200 to-gray-300 text-gray-800";
    }
  };

  // Determine label based on node type
  const getNodeTypeLabel = () => {
    switch (node.type) {
      case NodeType.TRIGGER:
        return "Trigger";
      case NodeType.THIRD_PARTY:
        return "Third Party";
      case NodeType.GENERATE_IMAGE:
        return "Generate Image";
      case NodeType.GENERATE_VIDEO:
        return "Generate Video";
      case NodeType.PUBLISH:
        return "Publish";
      default:
        return "Node";
    }
  };

  return (
    <div 
      className={`min-w-[250px] rounded-lg p-0 overflow-hidden border shadow-md transition-all duration-200 hover:shadow-lg ${
        isRoot ? "border-purple-300" : "border-gray-200"
      }`}
    >
      {/* Card Header with gradient */}
      <div className={`bg-gradient-to-r ${getNodeColorScheme()} p-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NodeIcon type={node.type} />
            <div className="text-sm font-medium">{getNodeTypeLabel()}</div>
          </div>
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-4 bg-white">
        <div className="text-sm text-gray-700">

        </div>

        {/* Button area */}
        <div className="mt-3">
          {children}
        </div>
      </div>
    </div>
  );
}; 