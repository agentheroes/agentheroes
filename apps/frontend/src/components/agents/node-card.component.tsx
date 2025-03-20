"use client";

import { FC, ReactNode } from "react";
import { NodeType } from "@packages/shared/agents/agent.flow";
import { TreeState } from "@frontend/components/agents/store";
import { NodeIcon } from "./node-icon.component";
import { NodeButton } from "./node-button.component";

interface NodeCardProps {
  node: TreeState;
  isRoot?: boolean;
  children?: ReactNode;
  onConfigure: () => void;
}

export const NodeCard: FC<NodeCardProps> = ({ 
  node, 
  isRoot = false, 
  children,
  onConfigure 
}) => {
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

  // Get configuration summary based on node data
  const getConfigSummary = () => {
    if (!node.data || Object.keys(node.data).length === 0) {
      return "Not configured";
    }

    switch (node.type) {
      case NodeType.TRIGGER:
        return node.data.triggerType 
          ? `Type: ${node.data.triggerType}` 
          : "Not configured";
      
      case NodeType.THIRD_PARTY:
        return node.data.serviceType 
          ? `Service: ${node.data.serviceType}` 
          : "Not configured";
      
      case NodeType.GENERATE_IMAGE:
        return node.data.generatorType 
          ? `Generator: ${node.data.generatorType}` 
          : "Not configured";
      
      case NodeType.GENERATE_VIDEO:
        return node.data.generatorType 
          ? `Generator: ${node.data.generatorType}` 
          : "Not configured";
      
      case NodeType.PUBLISH:
        if (node.data.platforms && node.data.platforms.length > 0) {
          return `Platforms: ${node.data.platforms.length}`;
        }
        return "Not configured";
      
      default:
        return "Not configured";
    }
  };

  // Render configuration details based on node type
  const renderConfigDetails = () => {
    if (!node.data || Object.keys(node.data).length === 0) {
      return (
        <div className="text-xs text-gray-400 italic">
          No configuration settings
        </div>
      );
    }

    switch (node.type) {
      case NodeType.TRIGGER:
        return (
          <div className="space-y-1">
            {node.data.triggerType && (
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-500">Type:</span>
                <span className="text-xs text-gray-700">{node.data.triggerType}</span>
              </div>
            )}
            {node.data.triggerType === "scheduled" && node.data.schedule && (
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-500">Schedule:</span>
                <span className="text-xs text-gray-700">{node.data.schedule}</span>
              </div>
            )}
            {node.data.triggerType === "webhook" && (
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-500">Webhook:</span>
                <span className="text-xs text-gray-700">Enabled</span>
              </div>
            )}
          </div>
        );
      
      case NodeType.THIRD_PARTY:
        return (
          <div className="space-y-1">
            {node.data.serviceType && (
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-500">Service:</span>
                <span className="text-xs text-gray-700">{node.data.serviceType}</span>
              </div>
            )}
            {node.data.serviceType === "api" && node.data.apiMethod && (
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-500">Method:</span>
                <span className="text-xs text-gray-700">{node.data.apiMethod}</span>
              </div>
            )}
            {node.data.serviceType === "api" && node.data.apiUrl && (
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-500">URL:</span>
                <span className="text-xs text-gray-700 truncate max-w-[130px]" title={node.data.apiUrl}>
                  {node.data.apiUrl}
                </span>
              </div>
            )}
            {node.data.serviceType === "custom" && node.data.customScript && (
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-500">Script:</span>
                <span className="text-xs text-gray-700">Custom script</span>
              </div>
            )}
          </div>
        );
      
      case NodeType.GENERATE_IMAGE:
        return (
          <div className="space-y-1">
            {node.data.generatorType && (
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-500">Generator:</span>
                <span className="text-xs text-gray-700">{node.data.generatorType}</span>
              </div>
            )}
            {node.data.imageSize && (
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-500">Size:</span>
                <span className="text-xs text-gray-700">{node.data.imageSize}</span>
              </div>
            )}
            {node.data.numImages && (
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-500">Count:</span>
                <span className="text-xs text-gray-700">{node.data.numImages}</span>
              </div>
            )}
            {node.data.prompt && (
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-500">Prompt:</span>
                <span className="text-xs text-gray-700 truncate max-w-[130px]" title={node.data.prompt}>
                  {node.data.prompt.substring(0, 20)}{node.data.prompt.length > 20 ? "..." : ""}
                </span>
              </div>
            )}
          </div>
        );
      
      case NodeType.GENERATE_VIDEO:
        return (
          <div className="space-y-1">
            {node.data.generatorType && (
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-500">Generator:</span>
                <span className="text-xs text-gray-700">{node.data.generatorType}</span>
              </div>
            )}
            {node.data.videoLength && (
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-500">Length:</span>
                <span className="text-xs text-gray-700">{node.data.videoLength}</span>
              </div>
            )}
            {node.data.videoQuality && (
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-500">Quality:</span>
                <span className="text-xs text-gray-700">{node.data.videoQuality}</span>
              </div>
            )}
            {node.data.useImage && (
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-500">Use Image:</span>
                <span className="text-xs text-gray-700">Yes</span>
              </div>
            )}
          </div>
        );
      
      case NodeType.PUBLISH:
        return (
          <div className="space-y-1">
            {node.data.platforms && node.data.platforms.length > 0 && (
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-500">Platforms:</span>
                <span className="text-xs text-gray-700">
                  {node.data.platforms.slice(0, 2).join(", ")}
                  {node.data.platforms.length > 2 ? ` +${node.data.platforms.length - 2}` : ""}
                </span>
              </div>
            )}
            {node.data.publishTime && (
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-500">Timing:</span>
                <span className="text-xs text-gray-700">{node.data.publishTime}</span>
              </div>
            )}
            {node.data.publishTime === "scheduled" && node.data.scheduleDate && (
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-500">Date:</span>
                <span className="text-xs text-gray-700 truncate max-w-[130px]" title={node.data.scheduleDate}>
                  {new Date(node.data.scheduleDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {node.data.caption && (
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-500">Caption:</span>
                <span className="text-xs text-gray-700 truncate max-w-[130px]" title={node.data.caption}>
                  {node.data.caption.substring(0, 20)}{node.data.caption.length > 20 ? "..." : ""}
                </span>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
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
        <div className="text-sm text-gray-700 mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500 font-medium">{getConfigSummary()}</span>
            <button 
              onClick={onConfigure}
              className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Configure
            </button>
          </div>
          
          {/* Configuration details */}
          <div className="py-1 px-2 bg-gray-50 rounded-md border border-gray-100">
            {renderConfigDetails()}
          </div>
        </div>

        {/* Button area */}
        <div className="mt-3">
          {children}
        </div>
      </div>
    </div>
  );
}; 