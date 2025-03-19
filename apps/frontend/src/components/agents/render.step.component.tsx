"use client";

import { FC } from "react";
import { Provider, useSelector } from "react-redux";
import store, {
  TreeState,
  treeSlice,
  useAppDispatch,
} from "@frontend/components/agents/store";
import { makeId } from "@packages/backend/encryption/make.id";
import { NodeType } from "@packages/shared/agents/agent.flow";
import { ArcherContainer, ArcherElement } from "react-archer";
import { createSelector } from "@reduxjs/toolkit";
import { NodeCard } from "./node-card.component";
import { NodeButton } from "./node-button.component";

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

  const addChildNode = () => {
    dispatch(
      treeSlice.actions.addValue({
        id: makeId(10),
        parent: node.id,
        type: node.type,
        data: {},
      }),
    );
  };

  const shouldShowAddButton =
    !isRoot || (isRoot && node.type === NodeType.TRIGGER);

  return (
    <div className="flex flex-col items-center gap-[60px]">
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
          <NodeCard node={node} isRoot={isRoot}>
            {shouldShowAddButton && (
              <NodeButton
                onClick={addChildNode}
                variant={isRoot ? "primary" : "secondary"}
              >
                Add Node
              </NodeButton>
            )}
          </NodeCard>
        </div>
      </ArcherElement>

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
