"use client";

import { FC, useState } from "react";
import { useAppDispatch } from "../store";
import { treeSlice } from "../store";
import { NodeButton } from "../node-button.component";

interface ThirdPartyConfigProps {
  nodeId: string;
  initialData: any;
  onClose: () => void;
}

type ServiceType = "mcp" | "api" | "custom";

export const ThirdPartyConfig: FC<ThirdPartyConfigProps> = ({
  nodeId,
  initialData,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const [serviceType, setServiceType] = useState<ServiceType>(
    initialData.serviceType || "mcp"
  );
  const [apiUrl, setApiUrl] = useState<string>(
    initialData.apiUrl || "https://"
  );
  const [apiMethod, setApiMethod] = useState<string>(
    initialData.apiMethod || "GET"
  );
  const [customScript, setCustomScript] = useState<string>(
    initialData.customScript || ""
  );

  const handleSave = () => {
    const data = {
      serviceType,
      ...(serviceType === "api" ? { apiUrl, apiMethod } : {}),
      ...(serviceType === "custom" ? { customScript } : {}),
    };
    
    dispatch(treeSlice.actions.updateNodeData({ id: nodeId, data }));
    onClose();
  };

  return (
    <div className="p-4">
      <h3 className="font-medium text-lg mb-4">Configure Third Party</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Service Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setServiceType("mcp")}
            className={`px-4 py-2 text-sm border rounded-md ${
              serviceType === "mcp"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            MCP
          </button>
          <button
            type="button"
            onClick={() => setServiceType("api")}
            className={`px-4 py-2 text-sm border rounded-md ${
              serviceType === "api"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            API
          </button>
          <button
            type="button"
            onClick={() => setServiceType("custom")}
            className={`px-4 py-2 text-sm border rounded-md ${
              serviceType === "custom"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            Custom
          </button>
        </div>
      </div>
      
      {serviceType === "mcp" && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            MCP will be used for this node.
          </p>
        </div>
      )}

      {serviceType === "api" && (
        <>
          <div className="mb-4">
            <label
              htmlFor="apiUrl"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              API URL
            </label>
            <input
              type="text"
              id="apiUrl"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="https://api.example.com"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["GET", "POST", "PUT", "DELETE"].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setApiMethod(method)}
                  className={`px-4 py-2 text-sm border rounded-md ${
                    apiMethod === method
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {serviceType === "custom" && (
        <div className="mb-4">
          <label
            htmlFor="customScript"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Custom Script
          </label>
          <textarea
            id="customScript"
            value={customScript}
            onChange={(e) => setCustomScript(e.target.value)}
            rows={5}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="// Write your custom script here"
          />
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