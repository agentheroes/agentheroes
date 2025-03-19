"use client";

import { FC, Fragment } from "react";
import {Provider, useSelector} from "react-redux";
import store, {
  TreeState,
  useAppSelector,
  treeSlice,
  useAppDispatch,
} from "@frontend/components/agents/store";
import { makeId } from "@packages/backend/encryption/make.id";
import { NodeType } from "@packages/shared/agents/agent.flow";
import { ArcherContainer } from "react-archer";
import {createSelector} from "@reduxjs/toolkit";

// Selectors
const selectTree = (state: { tree: TreeState[] }) => state.tree;

const selectRootNodes = createSelector(
  [selectTree],
  (tree) => tree.filter((item) => !item.parent)
);

const makeSelectChildNodes = () => {
  return createSelector(
    [selectTree, (_: any, parentId: string) => parentId],
    (tree, parentId) => tree.filter((item) => item.parent === parentId)
  );
};

// Node card component - renders a single node box
const NodeCard: FC<{ node: TreeState; isRoot?: boolean }> = ({
  node,
  isRoot = false,
}) => {
  const dispatch = useAppDispatch();

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

  return (
    <div
      className={`min-w-[200px] rounded-md p-4 bg-white text-black border border-gray-300 shadow-sm ${isRoot ? "bg-gray-100" : ""}`}
    >
      <div className="font-medium">
        {isRoot ? "API / MCP / SCHEDULE" : "RSS"}
      </div>

      {!isRoot && (
        <div className="mt-4">
          <button
            onClick={addChildNode}
            className="w-full border border-gray-300 rounded-md py-2 px-4 text-sm hover:bg-gray-50"
          >
            Add Node
          </button>
        </div>
      )}

      {isRoot && node.type === NodeType.TRIGGER && (
        <div className="mt-4">
          <button
            onClick={addChildNode}
            className="w-full border border-gray-300 rounded-md py-2 px-4 text-sm hover:bg-gray-50"
          >
            Add Node
          </button>
        </div>
      )}
    </div>
  );
};

// Child nodes container component
const ChildNodesContainer: FC<{
  parent: TreeState;
}> = ({ parent }) => {
  const selectChildNodes = makeSelectChildNodes();
  const childNodes = useSelector((state) => selectChildNodes(state, parent.id));

  if (childNodes.length === 0) return null;

  return (
    <div className="flex justify-center mt-2">
      <div className="flex flex-row space-x-12">
        {childNodes.map((childNode) => (
          <div key={childNode.id} className="flex flex-col items-center">
            <NodeBranch node={childNode} />
          </div>
        ))}
      </div>
    </div>
  );
};

// Node branch component - renders a node and its children
const NodeBranch: FC<{ node: TreeState }> = ({ node }) => {
  const selectChildNodes = makeSelectChildNodes();
  const childNodes = useSelector((state) => selectChildNodes(state, node.id));

  return (
    <div className="flex flex-col items-center">
      <NodeCard node={node} />

      {childNodes.length > 0 && (
        <>
          <div className="mt-4 flex flex-col items-center">
            <div className="text-sm text-gray-500">Generate image</div>
            <div className="text-sm text-gray-500 mb-2">Upload picture</div>

            <button className="w-full border border-gray-300 rounded-md py-2 px-4 text-sm hover:bg-gray-50">
              Add Node
            </button>
          </div>

          <ChildNodesContainer parent={node} />
        </>
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

  return (
    <div className="flex flex-col items-center">
      <NodeCard node={rootNode} isRoot={true} />
      <ChildNodesContainer parent={rootNode} />
    </div>
  );
};

// Main component that starts the rendering
export const RenderStepComponent: FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col mb-6">
        <h2 className="text-2xl font-bold">Create Agent</h2>
        <div className="flex flex-col mt-4">
          <Provider store={store}>
            <ArcherContainer strokeColor="red">
              <RenderTree />
            </ArcherContainer>
          </Provider>
        </div>
      </div>
    </div>
  );
};
