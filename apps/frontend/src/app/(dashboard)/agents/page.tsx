import { AgentGrid } from "@frontend/components/agents/agent.grid";
import { CreateAgentButton } from "@frontend/components/agents/create.agent.button";
import { AgentsProvider } from "@frontend/hooks/use-agents";

export default function AgentsPage() {
  return (
    <div className="max-w-7xl w-full mx-auto flex flex-col">
      <div className="flex">
        <h1 className="text-2xl font-bold mb-6 flex-1">Agents</h1>
        <CreateAgentButton />
      </div>
      <AgentsProvider>
        <AgentGrid />
      </AgentsProvider>
    </div>
  );
}
