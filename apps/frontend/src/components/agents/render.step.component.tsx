"use client";

import { FC, useState, useEffect } from "react";
import { Provider, useSelector } from "react-redux";
import store, {
  TreeState,
  treeSlice,
  useAppDispatch,
  workflowSlice,
  useAppSelector,
} from "@frontend/components/agents/store";
import { makeId } from "@packages/backend/encryption/make.id";
import { NodeType } from "@packages/shared/agents/agent.flow";
import { ArcherContainer, ArcherElement } from "react-archer";
import { createSelector } from "@reduxjs/toolkit";
import { NodeCard } from "./node-card.component";
import { NodeButton } from "./node-button.component";
import { NodeSelectionDialog } from "./node-selection-dialog.component";
import { NodeConfigurationDialog } from "./node-configuration-dialog.component";

// Helper function to build node path
const buildNodePath = (node: TreeState): string => {
  return node.parent ? `${node.parent}/${node.id}` : node.id;
};

// Selectors
const selectTree = (state: { tree: TreeState[] }) => state.tree;

const selectRootNodes = createSelector([selectTree], (tree) =>
  tree.filter((item) => !item.parent),
);

const makeSelectChildNodes = () => {
  return createSelector(
    [selectTree, (_: any, parentId: string) => parentId],
    (tree, parentId) => tree.filter((item) => item.parent === parentId),
  );
};

// Unified Node component that can render both root and child nodes
const NodeComponent: FC<{
  node: TreeState;
  isRoot?: boolean;
}> = ({ node, isRoot = false }) => {
  const dispatch = useAppDispatch();
  const selectChildNodes = makeSelectChildNodes();
  const childNodes = useSelector((state) => selectChildNodes(state, node.id));
  const [isSelectionDialogOpen, setIsSelectionDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [selectedNodeForConfig, setSelectedNodeForConfig] = useState<TreeState | null>(null);
  
  // Track newly added node ID to trigger configuration
  const [newlyAddedNodeId, setNewlyAddedNodeId] = useState<string | null>(null);

  // Watch for node output changes to update workflow path data
  const nodeOutputs = useAppSelector((state) => 
    state.tree.find(n => n.id === node.id)?.outputs
  );

  // Update workflow path data when node outputs change
  useEffect(() => {
    if (nodeOutputs && Object.keys(nodeOutputs).length > 0) {
      const nodePath = buildNodePath(node);
      console.log(`Updating path data for ${nodePath}:`, nodeOutputs);
      dispatch(workflowSlice.actions.updatePathData({ 
        nodeId: nodePath, 
        data: nodeOutputs 
      }));
    }
  }, [nodeOutputs, node, dispatch]);

  // Effect to find and configure newly added node
  useEffect(() => {
    if (newlyAddedNodeId) {
      const newNode = childNodes.find(node => node.id === newlyAddedNodeId);
      if (newNode) {
        setSelectedNodeForConfig(newNode);
        setIsConfigDialogOpen(true);
        setNewlyAddedNodeId(null);
      }
    }
  }, [childNodes, newlyAddedNodeId]);

  const openNodeSelectionDialog = () => {
    setIsSelectionDialogOpen(true);
  };

  const closeNodeSelectionDialog = () => {
    setIsSelectionDialogOpen(false);
  };

  const openNodeConfigDialog = (nodeToConfig: TreeState) => {
    setSelectedNodeForConfig(nodeToConfig);
    setIsConfigDialogOpen(true);
  };

  const closeNodeConfigDialog = () => {
    setIsConfigDialogOpen(false);
    setSelectedNodeForConfig(null);
  };

  const handleNodeSelection = (nodeType: NodeType) => {
    // Generate a new ID for the node
    const newNodeId = makeId(10);
    
    // Add the node
    dispatch(
      treeSlice.actions.addValue({
        id: newNodeId,
        parent: node.id,
        type: nodeType,
        data: {},
      }),
    );
    
    // Set newly added node ID to trigger configuration dialog
    setNewlyAddedNodeId(newNodeId);
    
    // Close the selection dialog
    closeNodeSelectionDialog();
  };

  const shouldShowAddButton =
    !isRoot || (isRoot && node.type === NodeType.TRIGGER);

  return (
    <div className="flex flex-col items-center gap-[60px] text-black">
      <ArcherElement
        id={node.id}
        relations={childNodes.map((p) => ({
          targetId: p.id,
          targetAnchor: "top",
          sourceAnchor: "bottom",
          style: { strokeWidth: 2, strokeDasharray: "5,5" },
        }))}
      >
        <div>
          <NodeCard 
            node={node} 
            isRoot={isRoot}
            onConfigure={() => openNodeConfigDialog(node)}
          >
            {shouldShowAddButton && (
              <NodeButton
                onClick={openNodeSelectionDialog}
                variant={isRoot ? "primary" : "secondary"}
              >
                Add Node
              </NodeButton>
            )}
          </NodeCard>
        </div>
      </ArcherElement>

      {/* Node Selection Dialog */}
      <NodeSelectionDialog
        isOpen={isSelectionDialogOpen}
        onClose={closeNodeSelectionDialog}
        onSelectNode={handleNodeSelection}
        currentNodeType={node.type}
      />

      {/* Node Configuration Dialog */}
      <NodeConfigurationDialog
        isOpen={isConfigDialogOpen}
        node={selectedNodeForConfig || node}
        onClose={closeNodeConfigDialog}
      />

      {/* Child Content */}
      {childNodes.length > 0 && (
        <div className="flex justify-center mt-2">
          <div className="flex flex-row space-x-16">
            {childNodes.map((childNode) => (
              <div key={childNode.id} className="flex flex-col items-center">
                <NodeComponent node={childNode} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Root component that renders the entire tree
export const RenderTree: FC = () => {
  const rootNodes = useSelector(selectRootNodes);

  if (rootNodes.length === 0) return <div>No nodes found</div>;

  // We'll just take the first root node
  const rootNode = rootNodes[0];

  return <NodeComponent node={rootNode} isRoot={true} />;
};

// Main component that starts the rendering
export const RenderStepComponent: FC = () => {
  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col mb-6">
          <h2 className="text-2xl font-bold">Create Agent</h2>
        </div>
      </div>
      <div>
        <div className="flex flex-col mt-4">
          <Provider store={store}>
            <ArcherContainer strokeColor="#6366F1" strokeWidth={2} offset={10}>
              <RenderTree />
            </ArcherContainer>
          </Provider>
        </div>
      </div>
    </>
  );
};
