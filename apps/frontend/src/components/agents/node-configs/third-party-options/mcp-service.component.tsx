"use client";

import { FC, useState } from "react";

interface MCPServiceProps {
  initialData: any;
  onDataChange: (data: any) => void;
}

type MCPService = "figma" | "airtable" | "github" | "notion" | "other";

export const MCPService: FC<MCPServiceProps> = ({
  initialData,
  onDataChange,
}) => {
  const [selectedService, setSelectedService] = useState<MCPService>(
    initialData.mcpService || "figma"
  );
  const [isConnected, setIsConnected] = useState<boolean>(
    initialData.isConnected || false
  );

  const handleServiceChange = (service: MCPService) => {
    setSelectedService(service);
    onDataChange({ 
      mcpService: service,
      isConnected 
    });
  };

  const handleConnect = () => {
    // In a real app, this would trigger OAuth flow or API key setup
    setIsConnected(true);
    onDataChange({
      mcpService: selectedService,
      isConnected: true
    });
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    onDataChange({
      mcpService: selectedService,
      isConnected: false
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select MCP Service
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "figma", label: "Figma" },
            { id: "airtable", label: "Airtable" },
            { id: "github", label: "GitHub" },
            { id: "notion", label: "Notion" },
            { id: "other", label: "Other" }
          ].map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => handleServiceChange(service.id as MCPService)}
              className={`px-4 py-2 text-sm border rounded-md ${
                selectedService === service.id
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              {service.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-md p-3">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              {isConnected ? "Connected to" : "Connect to"} {selectedService}
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              {isConnected 
                ? "Your account is connected and ready to use." 
                : "Connect your account to access data from this service."}
            </p>
          </div>
          <button
            onClick={isConnected ? handleDisconnect : handleConnect}
            className={`px-3 py-1 rounded-md text-sm ${
              isConnected
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
            }`}
          >
            {isConnected ? "Disconnect" : "Connect"}
          </button>
        </div>
      </div>

      {selectedService === "other" && (
        <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-md">
          <p className="text-sm text-yellow-700">
            Custom MCP integrations require additional setup. 
            Please contact support for assistance.
          </p>
        </div>
      )}
    </div>
  );
}; 