"use client";

import { FC, useState } from "react";
import { useAppDispatch } from "../store";
import { treeSlice } from "../store";
import { NodeButton } from "../node-button.component";

// Import option components
import { ManualTrigger } from "./trigger-options/manual-trigger.component";
import { ScheduledTrigger } from "./trigger-options/scheduled-trigger.component";
import { WebhookTrigger } from "./trigger-options/webhook-trigger.component";

interface TriggerConfigProps {
  nodeId: string;
  initialData: any;
  onClose: () => void;
}

type TriggerType = "manual" | "scheduled" | "webhook";

export const TriggerConfig: FC<TriggerConfigProps> = ({
  nodeId,
  initialData,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const [triggerType, setTriggerType] = useState<TriggerType>(
    initialData.triggerType || "manual"
  );
  const [schedule, setSchedule] = useState<string>(
    initialData.schedule || "0 0 * * *"
  );
  const [webhookId, setWebhookId] = useState<string>(
    initialData.webhookId || ""
  );

  const handleSave = () => {
    const data = {
      triggerType,
      ...(triggerType === "scheduled" ? { schedule } : {}),
      ...(triggerType === "webhook" ? { webhookId } : {}),
    };
    
    dispatch(treeSlice.actions.updateNodeData({ id: nodeId, data }));
    onClose();
  };

  const handleScheduleChange = (newSchedule: string) => {
    setSchedule(newSchedule);
  };

  // Render the appropriate configuration component based on trigger type
  const renderTriggerOptions = () => {
    switch (triggerType) {
      case "manual":
        return <ManualTrigger />;
      case "scheduled":
        return <ScheduledTrigger schedule={schedule} onScheduleChange={handleScheduleChange} />;
      case "webhook":
        return <WebhookTrigger webhookId={webhookId} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <h3 className="font-medium text-lg mb-4">Configure Trigger</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Trigger Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setTriggerType("manual")}
            className={`px-4 py-2 text-sm border rounded-md ${
              triggerType === "manual"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            Manual
          </button>
          <button
            type="button"
            onClick={() => setTriggerType("scheduled")}
            className={`px-4 py-2 text-sm border rounded-md ${
              triggerType === "scheduled"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            Scheduled
          </button>
          <button
            type="button"
            onClick={() => setTriggerType("webhook")}
            className={`px-4 py-2 text-sm border rounded-md ${
              triggerType === "webhook"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            Webhook
          </button>
        </div>
      </div>
      
      {/* Render trigger-specific options */}
      <div className="mt-4">
        {renderTriggerOptions()}
      </div>
      
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