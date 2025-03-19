"use client";

import { FC, Fragment, useState } from "react";
import { Provider } from "react-redux";
import store, {
  TreeState,
  useAppSelector,
} from "@frontend/components/agents/store";

export const RenderStepComponent: FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col mb-6">
        <h2 className="text-2xl font-bold">Create Agent</h2>
        <div className="flex flex-col">
          <Provider store={store}>
            <RenderNode />
          </Provider>
        </div>
      </div>
    </div>
  );
};

export const RenderNode: FC<{ parent?: TreeState }> = (props) => {
  const { parent } = props;
  const nodes = useAppSelector((p) =>
    !parent
      ? p.tree.filter((f) => !f.parent)
      : p.tree.filter((f) => f.parent === parent?.id),
  );

  return (
    <div className="flex gap-[10px]">
      {nodes.map((p) => (
        <Fragment key={p.id}>
          <div className="min-w-[150px] rounded-md p-[10px] bg-white text-black">
            Asd
          </div>

          <RenderNode parent={p} />
        </Fragment>
      ))}
    </div>
  );
};
