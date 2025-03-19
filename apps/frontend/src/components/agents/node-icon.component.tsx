"use client";

import { FC } from 'react';
import { NodeType } from "@packages/shared/agents/agent.flow";

interface NodeIconProps {
  type: NodeType;
  className?: string;
}

export const NodeIcon: FC<NodeIconProps> = ({ type, className = "" }) => {
  // Basic icon representation using characters and emoji
  // In a real app, you might use an icon library like heroicons, etc.
  const getIcon = () => {
    switch (type) {
      case NodeType.TRIGGER:
        return (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600">
            ⚡
          </div>
        );
      case NodeType.THIRD_PARTY:
        return (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600">
            🔌
          </div>
        );
      case NodeType.GENERATE_IMAGE:
        return (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-600">
            🖼️
          </div>
        );
      case NodeType.GENERATE_VIDEO:
        return (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
            🎬
          </div>
        );
      case NodeType.PUBLISH:
        return (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-pink-100 text-pink-600">
            📤
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600">
            📄
          </div>
        );
    }
  };

  return <div className={className}>{getIcon()}</div>;
}; 