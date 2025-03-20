import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NodeType } from "@packages/shared/agents/agent.flow";
import { useDispatch, useSelector } from "react-redux";
import { makeId } from "@packages/backend/encryption/make.id";

export interface TreeState {
  id: string;
  parent?: string;
  type: NodeType;
  data: any;
}

const id = makeId(10);
// Define the initial state using that type
const initialState: TreeState[] = [
  {
    id,
    type: NodeType.TRIGGER,
    data: {},
  },
];

export const treeSlice = createSlice({
  name: "tree",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    addValue: (state, action: PayloadAction<TreeState>) => {
      state.push(action.payload);
    },
    removeNode: (state, action: PayloadAction<string>) => {
      state = state.filter((f) => f.id !== action.payload);
    },
    updateNodeData: (state, action: PayloadAction<{ id: string; data: any }>) => {
      const { id, data } = action.payload;
      const node = state.find(node => node.id === id);
      if (node) {
        node.data = { ...node.data, ...data };
      }
    },
  },
});

const store = configureStore({
  reducer: {
    tree: treeSlice.reducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
