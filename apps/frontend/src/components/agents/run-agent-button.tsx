"use client";

import { useState } from "react";
import { Button } from "@frontend/components/ui/button";
import { RunAgentModal } from "@frontend/components/agents/run-agent-modal";
import { Agent } from "@frontend/types/agent";

interface RunAgentButtonProps {
  agent: Agent;
  variant?: "default" | "outline" | "destructive" | "ghost";
  size?: "default" | "sm";
}

export function RunAgentButton({ 
  agent, 
  variant = "default", 
  size = "default"
}: RunAgentButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button 
        onClick={openModal}
        size={size}
        className="bg-green-600 hover:bg-green-700 shadow-green"
      >
        Run
      </Button>
      
      <RunAgentModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        agent={agent}
      />
    </>
  );
} 