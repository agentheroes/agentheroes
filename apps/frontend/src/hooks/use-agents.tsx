"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { useFetch } from "@frontend/hooks/use-fetch";
import { Agent } from "@frontend/types/agent";

// Define the shape of our context
interface AgentsContextType {
  agents: Agent[];
  isLoading: boolean;
  error: string | null;
  fetchAgents: () => Promise<Agent[]>;
  toggleAgentActive: (agentId: string, active: boolean) => Promise<boolean>;
  deleteAgent: (agentId: string) => Promise<boolean>;
}

// Create the context with a default value
const AgentsContext = createContext<AgentsContextType | undefined>(undefined);

// Provider component
export function AgentsProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetch = useFetch();

  const fetchAgents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/agents");
      
      if (!response.ok) {
        throw new Error("Failed to fetch agents");
      }
      
      const data = await response.json();
      setAgents(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [fetch]);

  const toggleAgentActive = useCallback(async (agentId: string, active: boolean) => {
    try {
      const response = await fetch(`/agents/${agentId}/toggle`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle agent status");
      }

      setAgents((prevAgents) =>
        prevAgents.map((agent) =>
          agent.id === agentId ? { ...agent, active } : agent
        )
      );

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return false;
    }
  }, [fetch]);

  const deleteAgent = useCallback(async (agentId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/agents/${agentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete agent");
      }

      // Update local state immediately for responsive UI
      setAgents((prevAgents) => prevAgents.filter((agent) => agent.id !== agentId));
      
      // Also refresh from server to ensure consistency
      await fetchAgents();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetch, fetchAgents]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const value = {
    agents,
    isLoading,
    error,
    fetchAgents,
    toggleAgentActive,
    deleteAgent,
  };

  return <AgentsContext.Provider value={value}>{children}</AgentsContext.Provider>;
}

// Hook to use the context
export function useAgents() {
  const context = useContext(AgentsContext);
  if (context === undefined) {
    throw new Error("useAgents must be used within an AgentsProvider");
  }
  return context;
} 