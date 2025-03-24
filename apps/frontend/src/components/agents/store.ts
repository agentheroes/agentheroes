"use client";

import {
  configureStore,
  createSlice,
  PayloadAction,
  Middleware,
  createAction,
} from "@reduxjs/toolkit";
import { NodeType } from "@packages/shared/agents/agent.flow";
import { useDispatch, useSelector } from "react-redux";
import { makeId } from "@packages/backend/encryption/make.id";

export interface TreeState {
  id: string;
  parent?: string;
  type: NodeType;
  data: any;
  renderedText: string;
  isValid: boolean;
}

interface UpdateNodePayload {
  id: string;
  data: any;
  renderedText?: string;
}

const id = makeId(10);
// Define the initial state using that type
const initialState: TreeState[] = [
  {
    id,
    type: NodeType.TRIGGER,
    data: {},
    renderedText: "hello",
    isValid: true,
  },
];

// Create a separate action to be dispatched after addValue or updateNode
export const nodeActionCompleted = createAction<{
  actionType: string;
  nodeId: string;
  updatedState: TreeState[];
}>("tree/nodeActionCompleted");

export const treeSlice = createSlice({
  name: "tree",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState: [...initialState.map((p) => ({ ...p }))],
  reducers: {
    resetState: (state) => {
      state.splice(0, state.length);
      state.push(...initialState.map((p) => ({ ...p })));
    },
    setState: (state, action: PayloadAction<TreeState[]>) => {
      state.splice(0, state.length);
      state.push(...action.payload);
    },
    addValue: (state, action: PayloadAction<TreeState>) => {
      state.push(action.payload);
    },
    removeNode: (state, action: PayloadAction<string>) => {
      // Find all nodes to delete (including children recursively)
      const nodesToDelete = getNodeAndChildrenIds(state, action.payload);

      // Create a new array without the nodes to delete
      const filteredState = state.filter(
        (node) => !nodesToDelete.includes(node.id),
      );

      // Replace the entire state
      return filteredState;
    },
    updateNode: (state, action: PayloadAction<UpdateNodePayload>) => {
      const index = state.findIndex((node) => node.id === action.payload.id);
      if (index !== -1) {
        state[index].data = action.payload.data;
        // Update renderedText if provided
        if (action.payload.renderedText !== undefined) {
          state[index].renderedText = action.payload.renderedText;
        }

        state[index].isValid = true;
      }

      const children = getAllTheChildrenComponents(state, action.payload.id);
      for (const node of children) {
        const findIndex = state.map((p: any) => p.id).indexOf(node.id);
        state[findIndex].isValid = false;
      }
    },
  },
});

const getAllTheParentComponents = (
  treeState: TreeState[],
  currentNode: string,
): TreeState[] => {
  const parent = treeState.find((node) => node.id === currentNode);
  return [
    parent,
    ...(parent.parent
      ? getAllTheParentComponents(treeState, parent.parent)
      : []),
  ];
};

const getAllTheChildrenComponents = (
  treeState: TreeState[],
  currentNode: string,
): TreeState[] => {
  return treeState
    .filter((node) => node.parent === currentNode)
    .reduce((all, current) => {
      return [
        ...all,
        current,
        ...getAllTheChildrenComponents(treeState, current.id),
      ];
    }, []);
};

export const validationErrors = createSlice({
  name: "validation",
  initialState: { validation: {} } as {
    validation: { [key: string]: string[] };
  },
  reducers: {
    setValue: (
      state,
      action: PayloadAction<{ id: string; value: string[] }>,
    ) => {
      if (
        action.payload.value.length === 0 &&
        state.validation[action.payload.id]
      ) {
        delete state.validation[action.payload.id];
      }

      state.validation[action.payload.id] = action.payload.value;
    },
    deleteAll: (state) => {
      state.validation = {};
    },
  },
});

// Helper function to get a node and all its children recursively
function getNodeAndChildrenIds(nodes: TreeState[], nodeId: string): string[] {
  const result: string[] = [nodeId];

  // Find direct children
  const childNodes = nodes.filter((node) => node.parent === nodeId);

  // Recursively add children of children
  childNodes.forEach((child) => {
    result.push(...getNodeAndChildrenIds(nodes, child.id));
  });

  return result;
}

const store = configureStore({
  reducer: {
    tree: treeSlice.reducer,
    validation: validationErrors.reducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export const { addValue, updateNode, removeNode } = treeSlice.actions;
export const { setValue, deleteAll } = validationErrors.actions;
