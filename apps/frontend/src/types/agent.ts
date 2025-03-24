export interface AgentStep {
  id: string;
  type: string;
  node: string;
  data: string;
  parentId: string;
  renderedText: string;
  agentId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Agent {
  id: string;
  name: string;
  textModel?: string;
  organizationId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  agentSteps: AgentStep[];
} 