"use client";

import { useMemo, useState } from "react";
import { Button } from "@frontend/components/ui/button";
import { Agent } from "@frontend/types/agent";
import { useAgents } from "@frontend/hooks/use-agents";
import { Icons } from "@frontend/components/icons";
import { DeleteAgentConfirmationDialog } from "@frontend/components/agents/delete-agent-confirmation-dialog.component";
import { capitalize } from "lodash";
import { CopyableInput } from "@frontend/components/ui/copyable-input";
import { RunAgentButton } from "@frontend/components/agents/run-agent-button";

interface AgentGridItemProps {
  agent: Agent;
}

export function AgentGridItem({ agent }: AgentGridItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toggleAgentActive, deleteAgent } = useAgents();

  // Show info based on agent type and text model
  const renderInfo = useMemo(() => {
    let info;
    
    switch (agent.agentSteps[0].node) {
      case "api":
        info = (
          <CopyableInput 
            value={new URL(window.location.href).origin + "/v1/api/trigger/" + agent.id}
            successMessage="API URL copied to clipboard!"
          />
        );
        break;
      case "schedule":
        info = agent.agentSteps[0].renderedText;
        break;
      default:
        info = null;
    }

    // Add text model info if available
    if (agent.textModel) {
      return (
        <div className="flex flex-col space-y-2">
          {info && <div>{info}</div>}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Text Model:</span>
            <span className="text-xs font-medium">{agent.textModel}</span>
          </div>
        </div>
      );
    }
    
    return info || <span className="text-muted-foreground">No additional info</span>;
  }, [agent]);

  const handleToggleActive = async () => {
    await toggleAgentActive(agent.id, !agent.active);
  };

  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const success = await deleteAgent(agent.id);
      if (!success) {
        // If the delete operation failed, we need to notify the user
        alert("Failed to delete agent");
      }
      closeDeleteDialog();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="p-3 text-center bg-[#151515] h-full flex justify-center items-center">
        <div onClick={handleToggleActive} className="cursor-pointer">
          {agent.active ? (
            <div className="text-[#000]">
              <Icons.stop
                strokeWidth={0}
                fill="url(#a)"
                className="h-8 w-8 !p-0"
              >
                <defs>
                  <linearGradient
                    id="a"
                    x1="50%"
                    x2="50%"
                    y1="0%"
                    y2="100%"
                    gradientTransform="rotate(150 .5 .5)"
                  >
                    <stop offset="0%" stopColor="hsl(353, 98%, 41%)" />
                    <stop offset="100%" stopColor="hsl(37, 98%, 41%)" />
                  </linearGradient>
                </defs>
              </Icons.stop>
            </div>
          ) : (
            <Icons.play
              strokeWidth={0}
              className="h-8 w-8 ml-0.5 !p-0"
              fill="url(#c)"
            >
              <defs>
                <linearGradient
                  id="c"
                  x1="50%"
                  x2="50%"
                  y1="0%"
                  y2="100%"
                  gradientTransform="rotate(150 .5 .5)"
                >
                  <stop offset="0%" stopColor="hsl(135, 100%, 50%)" />
                  <stop offset="100%" stopColor="hsl(100, 74%, 15%)" />
                </linearGradient>
              </defs>
            </Icons.play>
          )}
        </div>
      </div>
      <div className="p-3 bg-[#151515] h-full flex items-center">
        <div className="flex items-center">
          <span className="font-medium">{agent.name}</span>
        </div>
      </div>
      <div className="p-3 bg-[#151515] h-full flex items-center">
        <div className="flex items-center">
          <span className="font-medium">
            {capitalize(agent.agentSteps[0].node)}
          </span>
        </div>
      </div>
      <div className="p-3 bg-[#151515] h-full flex items-center">
        <div className="flex items-center w-full">
          {renderInfo}
        </div>
      </div>
      <div className="p-3 bg-[#151515] h-full">
        <div className="flex space-x-2">
          <RunAgentButton agent={agent} size="sm" />
          <a href={`/agents/${agent.id}`}>
            <Button size="sm">Edit</Button>
          </a>
          <Button
            variant="destructive"
            size="sm"
            onClick={openDeleteDialog}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </div>
      </div>

      <DeleteAgentConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        agentName={agent.name}
        isDeleting={isDeleting}
      />
    </>
  );
}
