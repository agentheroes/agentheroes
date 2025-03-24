"use client";

import { FC } from 'react';
import { NodeType } from "@packages/shared/agents/agent.flow";
import { cn } from "@frontend/lib/utils";

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
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1A1A1A] text-green-500">
            ⚡
          </div>
        );
      case NodeType.THIRD_PARTY:
        return (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1A1A1A] text-amber-500">
            🔌
          </div>
        );
      case NodeType.GENERATE_IMAGE:
        return (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1A1A1A] text-purple-500">
            🖼️
          </div>
        );
      case NodeType.GENERATE_VIDEO:
        return (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1A1A1A] text-blue-500">
            🎬
          </div>
        );
      case NodeType.PUBLISH:
        return (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1A1A1A] text-pink-500">
            📤
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1A1A1A] text-gray-400">
            📄
          </div>
        );
    }
  };

  return <div className={cn(className)}>{getIcon()}</div>;
}; 