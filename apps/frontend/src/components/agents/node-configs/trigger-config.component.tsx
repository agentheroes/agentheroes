"use client";

import { FC, useState, useEffect } from "react";
import { useAppDispatch, useAppSelector, treeSlice } from "../store";
import { NodeButton } from "../node-button.component";
import { Input } from "@frontend/components/ui/input";

interface TriggerConfigProps {
  nodeId: string;
  initialData?: any;
  onClose: () => void;
}

type TriggerType = "api" | "schedule";

export const TriggerConfig: FC<TriggerConfigProps> = ({
  nodeId,
  initialData,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  
  // Get node data from Redux store
  const node = useAppSelector((state) => 
    state.tree.find(n => n.id === nodeId)
  );
  
  // Merge initialData with node inputs
  const mergedInitialData = {
    ...(initialData || {}),
    ...(node?.inputs || {})
  };
  
  const [triggerType, setTriggerType] = useState<TriggerType>(
    mergedInitialData.triggerType || "api"
  );
  
  const [cronExpression, setCronExpression] = useState<string>(
    mergedInitialData.cronExpression || "0 0 * * *"
  );

  // Update the inputs in the store when our configuration changes
  useEffect(() => {
    dispatch(treeSlice.actions.updateNodeInputs({ 
      id: nodeId, 
      inputs: { 
        triggerType,
        ...(triggerType === "schedule" ? { cronExpression } : {})
      } 
    }));
  }, [triggerType, cronExpression, dispatch, nodeId]);

  const handleTriggerTypeChange = (type: TriggerType) => {
    setTriggerType(type);
  };

  const handleCronExpressionChange = (expression: string) => {
    setCronExpression(expression);
  };

  const handleSave = () => {
    // For backward compatibility, still update node.data
    dispatch(treeSlice.actions.updateNodeData({ 
      id: nodeId, 
      data: { 
        triggerType,
        ...(triggerType === "schedule" ? { cronExpression } : {})
      } 
    }));
    
    // Set the outputs that downstream nodes can access
    const outputData = {
      triggerType,
      // For API triggers, we simulate an endpoint
      ...(triggerType === "api" ? { 
        apiEndpoint: `/api/triggers/${nodeId}`,
        apiMethod: "POST"
      } : { 
        cronExpression 
      })
    };
    
    console.log("TriggerConfig saving with triggerType:", triggerType);
    console.log("TriggerConfig setting outputs:", outputData);
    
    // Update node outputs
    dispatch(treeSlice.actions.updateNodeOutputs({
      id: nodeId,
      outputs: outputData
    }));
    
    onClose();
  };

  // Render schedule configuration
  const renderScheduleConfig = () => {
    if (triggerType !== "schedule") return null;
    
    return (
      <div className="mt-4">
        <label
          htmlFor="cronExpression"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Cron Schedule
        </label>
        <Input
          type="text"
          id="cronExpression"
          value={cronExpression}
          onChange={(e) => handleCronExpressionChange(e.target.value)}
          className="block w-full"
          placeholder="0 0 * * *"
        />
        <p className="text-xs text-gray-500 mt-1">
          Use cron syntax: minute hour day-of-month month day-of-week
          <br />
          Example: "0 0 * * *" = daily at midnight
        </p>
      </div>
    );
  };

  // Render API configuration
  const renderApiConfig = () => {
    if (triggerType !== "api") return null;
    
    return (
      <div className="mt-4">
        <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">API Trigger Endpoint</h4>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs bg-gray-100 p-2 rounded flex-grow overflow-x-auto">
              POST /api/triggers/{nodeId}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`/api/triggers/${nodeId}`);
              }}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Copy to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Send a POST request to this endpoint with a JSON body containing:
            <br />
            <code className="text-xs bg-gray-100 p-1 rounded inline-block mt-1">
              {"{ \"prompt\": \"Your prompt\", \"imageUrl\": \"https://example.com/image.jpg\" }"}
            </code>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <h3 className="font-medium text-lg mb-4">Configure Trigger</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Trigger Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleTriggerTypeChange("api")}
            className={`px-4 py-2 text-sm border rounded-md ${
              triggerType === "api"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            API
          </button>
          <button
            type="button"
            onClick={() => handleTriggerTypeChange("schedule")}
            className={`px-4 py-2 text-sm border rounded-md ${
              triggerType === "schedule"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            Schedule
          </button>
        </div>
      </div>
      
      {/* Render type-specific options */}
      {triggerType === "api" ? renderApiConfig() : renderScheduleConfig()}
      
      <div className="flex justify-end gap-2 mt-6">
        <NodeButton onClick={onClose} variant="ghost">
          Cancel
        </NodeButton>
        <NodeButton onClick={handleSave} variant="primary">
          Save Configuration
        </NodeButton>
      </div>
    </div>
  );
}; 