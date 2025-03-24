"use client";

import {
  NodeComponent,
  nodesHighOrderComponent,
} from "@frontend/components/agents/nodes/nodes.high.order.component";
import { NodeType } from "@packages/shared/agents/agent.flow";
import { ReactNode } from "react";

class ApiNodeComponent extends NodeComponent {
  render(): ReactNode {
    return (
      <div className="flex flex-col gap-[10px]">
        Api requires you to add <pre>{`{prompt: string}`}</pre> in the body
      </div>
    );
  }

  renderNode() {
    return `Send an http/s POST request to trigger the workflow`;
  }
}

// const ApiNodeComponent: FC<{
//   node: TreeState;
//   updateData: (params: any) => string;
// }> = (props) => {
//   return null;
// };

export default nodesHighOrderComponent({
  title: "API",
  outputs: ["prompt"],
  identifier: "api",
  component: ApiNodeComponent,
  type: NodeType.TRIGGER,
});
