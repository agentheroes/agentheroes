"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@frontend/components/ui/dialog";
import { Button } from "@frontend/components/ui/button";
import { Input } from "@frontend/components/ui/input";
import { Agent } from "@frontend/types/agent";
import {useFetch} from "@frontend/hooks/use-fetch";

interface StreamEvent {
  type: string;
  node: string;
}

interface RunAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent;
}

export function RunAgentModal({ isOpen, onClose, agent }: RunAgentModalProps) {
  const [prompt, setPrompt] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fetch = useFetch();
  
  const isApiType = agent.agentSteps[0]?.node === "api";
  
  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPrompt("");
      setEvents([]);
      setError(null);
      setIsRunning(false);
    }
  }, [isOpen]);
  
  const runAgent = async () => {
    setIsRunning(true);
    setEvents([]);
    setError(null);
    
    try {
      // Create request URL
      const url = `/trigger/${agent.id}/events`;
      
      // Prepare request options for the useFetch hook
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // For API type agents, include prompt in the request body
        ...(isApiType && prompt ? { body: JSON.stringify({ prompt }) } : {})
      };
      
      // Start the stream request using the useFetch hook
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Handle the stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Could not get reader from response");
      }
      
      // Read the stream
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value);
        // Process each line (event)
        const lines = text.split("\n").filter(line => line.trim().startsWith("data: "));
        
        for (const line of lines) {
          try {
            // Extract the JSON data part
            const jsonStr = line.substring(line.indexOf("{"));
            const eventData = JSON.parse(jsonStr) as StreamEvent;
            
            setEvents(prev => [...prev, eventData]);
          } catch (e) {
            console.error("Error parsing event:", e);
          }
        }
      }
      
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setIsRunning(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Run Agent: {agent.name}</DialogTitle>
        </DialogHeader>
        
        {isApiType && (
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              Prompt
            </label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              disabled={isRunning}
            />
          </div>
        )}
        
        {events.length > 0 && (
          <div className="border rounded-md p-3 bg-black/20 max-h-60 overflow-y-auto my-4">
            <h3 className="font-medium text-sm mb-2">Execution Progress:</h3>
            <div className="space-y-2">
              {events.map((event, index) => (
                <div key={index} className="text-sm flex items-center space-x-2">
                  <span className="text-green-500">•</span>
                  <span className="font-semibold">{event.type}:</span>
                  <span>{event.node}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {error && (
          <div className="text-red-500 text-sm my-2">
            {error}
          </div>
        )}
        
        <DialogFooter className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isRunning}
          >
            Close
          </Button>
          <Button
            onClick={runAgent}
            disabled={isRunning}
          >
            {isRunning ? "Running..." : "Run Agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 