import { NodeType } from "@packages/shared/agents/agent.flow";
import {AgentProviderInterface, Params} from "@packages/shared/agents/agent.provider.interface";
import {FC} from "react";

export const Render: FC<{updateInformation: (p: any) => void}> = () => {
  return <div />;
};

export class EmptyAgentProvider implements AgentProviderInterface {
  name = "Empty";
  type = NodeType.TRIGGER;
  render(params: Params) {
    return <Render {...params} />;
  }
}
