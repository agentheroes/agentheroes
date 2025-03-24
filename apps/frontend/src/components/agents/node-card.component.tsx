"use client";

import { FC, ReactNode } from "react";
import { NodeType } from "@packages/shared/agents/agent.flow";
import { TreeState } from "@frontend/components/agents/store";
import { NodeIcon } from "@frontend/components/agents/node-icon.component";
import { nodeList } from "@frontend/components/agents/nodes/node.list";
import { NodeButton } from "@frontend/components/agents/node-button.component";
import { Trash2 } from "lucide-react";
import {
  RenderField,
  useNodeWrapper,
} from "@frontend/components/agents/node.wrapper.context";
import { cn } from "@frontend/lib/utils";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@frontend/components/ui/card";

interface NodeCardProps {
  node: TreeState;
  isRoot?: boolean;
  children?: ReactNode;
  onConfigureNode?: () => void;
  onDeleteNode?: () => void;
}

export const NodeCard: FC<NodeCardProps> = ({
  node,
  isRoot = false,
  children,
  onConfigureNode,
  onDeleteNode,
}) => {

  // Determine node accent color based on type
  const getNodeAccentColor = () => {
    if (isRoot) {
      return "border-t-4 border-t-[#FD7302]";
    }

    switch (node.type) {
      case NodeType.TRIGGER:
        return "border-t-4 border-t-green-400";
      case NodeType.THIRD_PARTY:
        return "border-t-4 border-t-amber-400";
      case NodeType.GENERATE_IMAGE:
        return "border-t-4 border-t-purple-400";
      case NodeType.GENERATE_VIDEO:
        return "border-t-4 border-t-blue-400";
      case NodeType.PUBLISH:
        return "border-t-4 border-t-pink-400";
      default:
        return "border-t-4 border-t-gray-400";
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

  // Get the specific node title from the nodeList if available
  const getNodeTitle = () => {
    if (node.data && node.data.nodeIdentifier) {
      const nodeConfig = nodeList.find(
        (n) => n.identifier === node.data.nodeIdentifier,
      );
      return nodeConfig ? nodeConfig.title : "";
    }
    return "";
  };

  const nodeTitle = getNodeTitle();
  const hasNodeIdentifier = Boolean(node.data && node.data.nodeIdentifier);
  // Only show delete button for non-root nodes
  const canDelete = !isRoot && onDeleteNode;

  return (
    <Card
      className={cn(
        "w-[500px] overflow-hidden transition-all duration-200 hover:shadow-lg rounded-xl border border-[#1F1F1F]",
        getNodeAccentColor(),
        !node.isValid && "border-2 border-red-600"
      )}
    >
      <CardHeader className="p-3 flex flex-row items-center justify-between bg-[#121212]">
        <div className="flex items-center gap-2">
          <NodeIcon type={node.type} />
          <div className="text-sm font-medium text-white">{getNodeTypeLabel()}</div>
        </div>

        {canDelete && (
          <button
            onClick={onDeleteNode}
            className="text-gray-300 opacity-70 hover:opacity-100 transition-opacity hover:text-red-400"
            aria-label="Delete node"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col bg-[#0D0D0D]">
        <div className="text-sm overflow-y-auto text-gray-200">
          {nodeTitle && <div className="font-semibold mb-2 text-[#FD7302]">{nodeTitle}</div>}

          {/* Display the rendered text from the node */}
          {node.renderedText ? (
            <div className="mt-2 p-2 bg-[#121212] rounded-md whitespace-pre-wrap text-sm max-h-[120px] overflow-y-auto border border-[#1F1F1F] text-gray-300">
              {node.renderedText}
            </div>
          ) : (
            <RenderField exists={true} property="prompt">
              <div className="text-gray-300">Hello</div>
            </RenderField>
          )}
        </div>
      </CardContent>

      {/* Button area */}
      <CardFooter className="p-4 pt-3 flex gap-2 flex-wrap border-t border-[#1F1F1F] bg-[#0A0A0A]">
        {hasNodeIdentifier && onConfigureNode && (
          <NodeButton onClick={onConfigureNode} variant="outline">
            Configure
          </NodeButton>
        )}
        {children}
      </CardFooter>
    </Card>
  );
};
