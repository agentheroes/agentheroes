"use client";

import { AgentGridItem } from "@frontend/components/agents/agent.grid.item";
import { Spinner } from "@frontend/components/ui/spinner";
import { useAgents } from "@frontend/hooks/use-agents";

export function AgentGrid() {
  const { agents, isLoading, error } = useAgents();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="text-center p-8 border border-gray-200 rounded-lg">
        <p className="text-gray-500">
          No agents found. Create your first agent to get started.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Grid header - maintaining the table-like appearance */}
      <div className="grid grid-cols-[80px_1fr_auto_auto_auto] items-center gap-[2px] text-left rounded-t-lg">
        <div className="p-3 text-sm font-medium text-gray-300 bg-gray-800 flex justify-center">
          Active
        </div>
        <div className="p-3 text-sm font-medium text-gray-300 bg-gray-800">
          Name
        </div>
        <div className="p-3 text-sm font-medium text-gray-300 bg-gray-800">
          Type
        </div>
        <div className="p-3 text-sm font-medium text-gray-300 bg-gray-800">
          Information
        </div>
        <div className="p-3 text-sm font-medium text-gray-300 text-center bg-gray-800">
          &nbsp;
        </div>
        {/* Grid items */}
        {agents.map((agent) => (
          <AgentGridItem key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
