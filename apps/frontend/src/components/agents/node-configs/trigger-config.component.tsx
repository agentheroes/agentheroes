"use client";

import { FC, useState } from "react";
import { useAppDispatch } from "../store";
import { treeSlice } from "../store";
import { NodeButton } from "../node-button.component";

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

  const handleSave = () => {
    const data = {
      triggerType,
      ...(triggerType === "scheduled" ? { schedule } : {}),
    };
    
    dispatch(treeSlice.actions.updateNodeData({ id: nodeId, data }));
    onClose();
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
      
      {triggerType === "scheduled" && (
        <div className="mb-4">
          <label
            htmlFor="schedule"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Schedule (Cron Expression)
          </label>
          <input
            type="text"
            id="schedule"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="0 0 * * *"
          />
          <p className="text-xs text-gray-500 mt-1">
            Format: minute hour day-of-month month day-of-week
          </p>
        </div>
      )}

      {triggerType === "webhook" && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            Webhook URL will be generated after saving.
          </p>
        </div>
      )}
      
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