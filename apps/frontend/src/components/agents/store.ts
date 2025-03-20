import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NodeType } from "@packages/shared/agents/agent.flow";
import { useDispatch, useSelector } from "react-redux";
import { makeId } from "@packages/backend/encryption/make.id";

export interface TreeState {
  id: string;
  parent?: string;
  type: NodeType;
  data: any;
  // Add inputs and outputs for the workflow
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
}

// Define a type for the entire workflow state
export interface WorkflowState {
  pathData: Record<string, any>;
}

const id = makeId(10);
// Define the initial state using that type
const initialState: TreeState[] = [
  {
    id,
    type: NodeType.TRIGGER,
    data: {},
    inputs: {},
    outputs: {},
  },
];

// Initial workflow state
const initialWorkflowState: WorkflowState = {
  pathData: {},
};

export const treeSlice = createSlice({
  name: "tree",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    addValue: (state, action: PayloadAction<TreeState>) => {
      // Ensure inputs and outputs are initialized
      const newNode = {
        ...action.payload,
        inputs: action.payload.inputs || {},
        outputs: action.payload.outputs || {},
      };
      state.push(newNode);
    },
    removeNode: (state, action: PayloadAction<string>) => {
      return state.filter((f) => f.id !== action.payload);
    },
    updateNodeData: (state, action: PayloadAction<{ id: string; data: any }>) => {
      const { id, data } = action.payload;
      const node = state.find(node => node.id === id);
      if (node) {
        node.data = { ...node.data, ...data };
      }
    },
    updateNodeInputs: (state, action: PayloadAction<{ id: string; inputs: Record<string, any> }>) => {
      const { id, inputs } = action.payload;
      const node = state.find(node => node.id === id);
      if (node) {
        node.inputs = { ...node.inputs, ...inputs };
      }
    },
    updateNodeOutputs: (state, action: PayloadAction<{ id: string; outputs: Record<string, any> }>) => {
      const { id, outputs } = action.payload;
      const node = state.find(node => node.id === id);
      if (node) {
        node.outputs = { ...node.outputs, ...outputs };
        
        // Find child nodes and update their inputs
        const childNodes = state.filter(n => n.parent === id);
        for (const childNode of childNodes) {
          if (childNode.inputs) {
            childNode.inputs = { ...childNode.inputs, ...outputs };
          }
        }
      }
    },
  },
});

// Create a workflow slice to manage the path data
export const workflowSlice = createSlice({
  name: "workflow",
  initialState: initialWorkflowState,
  reducers: {
    updatePathData: (state, action: PayloadAction<{ nodeId: string; data: any }>) => {
      const { nodeId, data } = action.payload;
      state.pathData[nodeId] = { ...state.pathData[nodeId], ...data };
    },
    clearPathData: (state, action: PayloadAction<string>) => {
      // Clear data for a specific node
      delete state.pathData[action.payload];
    },
  },
});

const store = configureStore({
  reducer: {
    tree: treeSlice.reducer,
    workflow: workflowSlice.reducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
