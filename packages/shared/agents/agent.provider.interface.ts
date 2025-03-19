import { NodeType } from "@packages/shared/agents/agent.flow";
import Element = React.JSX.Element;

export interface Params {
  updateInformation: (p: any) => void
}
export interface AgentProviderInterface {
  name: string;
  type: NodeType;
  render: (params: Params) => Element;
}
